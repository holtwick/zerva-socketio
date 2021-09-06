// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger, promisify, tryTimeout } from "zeed"
import { Socket } from "socket.io"

declare global {
  interface ZContextEvents {
    socketIOConnect(conn: ZSocketIOConnection): void
    socketIODisconnect(conn: ZSocketIOConnection, error?: string): void
  }
}

const log = Logger("conn")

export class ZSocketIOConnection {
  id: string
  socket: Socket
  timeout: number
  verified: boolean = false
  log: any

  constructor(socket: any, timeout: number = -1) {
    this.socket = socket
    this.id = socket.id
    this.timeout = timeout
    this.log = Logger(`conn:${this.id?.substr(0, 6)}`)
  }

  /** Emits event and can return result. On timeout or other error `null` will be returned */
  async emit<U extends keyof ZSocketIOEvents>(
    event: U,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]> | null> {
    try {
      return await tryTimeout(
        new Promise((resolve) => {
          this.log("emit", event)
          this.socket.emit(event, args[0], resolve)
        }),
        this.timeout
      )
    } catch (err) {
      this.log.warn("emit error", err, event)
    }
    return null
  }

  /** Listen to event and provide result if requested */
  async on<U extends keyof ZSocketIOEvents>(
    event: U,
    listener: ZSocketIOEvents[U]
  ) {
    // @ts-ignore
    this.socket.on(event, async (data: any, callback: any) => {
      try {
        this.log("on", event)
        let result = await promisify(listener(data))
        this.log("->", result, "on", event)
        if (callback) callback(result)
      } catch (err: any) {
        this.log("-> error:", err, "on", event)
        if (callback) callback({ error: err.message })
      }
    })
  }

  onAny(fn: any) {
    this.socket.onAny((...args) => {
      this.log("onAny", ...args)
      fn(...args)
    })
  }

  onClose(fn: any) {
    this.socket.on("close", fn) // ???
    this.socket.on("disconnect", fn)
    this.socket.on("error", fn)
  }

  // static async broadcast<U extends keyof VSocketEvents>(
  //   connections: VSocketConnection[],
  //   event: U,
  //   ...args: Parameters<VSocketEvents[U]>
  // ): Promise<void> {
  //   this.log(
  //     "broadcast to",
  //     connections.map((conn) => conn.id)
  //   )
  //   await Promise.all(connections.map((conn) => conn.emit(event, ...args)))
  // }
}
