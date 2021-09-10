import { empty, Logger, promisify } from "zeed"
import { Socket, ManagerOptions, SocketOptions } from "socket.io-client"
import io from "socket.io-client"

import "./types"

const log = Logger("websocket")

export const getWebsocketUrlFromLocation = () =>
  "ws" + location.protocol.substr(4) + "//" + location.host

export class ZSocketIOConnection {
  private socket?: Socket

  constructor(socket: Socket) {
    this.socket = socket
    // this.socket?.onAny((...args) => {
    //   log("onAny", ...args)
    // })
  }

  get id(): string {
    let id = this.socket?.id
    if (empty(id)) {
      log.warn("Expected to find a socket ID")
    }
    return id || ""
  }

  get shortId() {
    return String(this.socket?.id || "").substr(0, 6)
  }

  emit<U extends keyof ZSocketIOEvents>(
    event: U,
    ...args: Parameters<ZSocketIOEvents[U]>
  ): Promise<ReturnType<ZSocketIOEvents[U]>> {
    return new Promise((resolve) => {
      log("=> EMIT  ", this.shortId, event, JSON.stringify(args).substr(0, 40))
      this.socket?.emit(event, args[0], (value: any) => {
        log(
          "->   EMIT",
          this.shortId,
          event,
          JSON.stringify(value).substr(0, 40)
        )
        resolve(value)
      })
    })
  }

  async on<U extends keyof ZSocketIOEvents>(
    event: U,
    listener: ZSocketIOEvents[U]
  ) {
    // @ts-ignore
    this.socket?.on(event, async (data: any, callback: any) => {
      try {
        log(
          "=> ON    ",
          this.shortId,
          event,
          JSON.stringify(data).substr(0, 40)
        )
        let result = await promisify(listener(data))
        log(
          "->   ON  ",
          this.shortId,
          event,
          result ? JSON.stringify(result).substr(0, 40) : ""
        )
        if (callback) callback(result)
      } catch (err: any) {
        log.warn("#>   ON  ", this.shortId, event, err)
        if (callback) callback({ error: err.message })
      }
    })
  }

  onAny(fn: any) {
    this.socket?.onAny((...args) => {
      log("onAny", ...args)
      fn(...args)
    })
  }

  close() {
    this.socket?.close()
    this.socket = undefined
  }

  public static connect(
    host?: string,
    options?: ManagerOptions & SocketOptions
  ): ZSocketIOConnection {
    let wsHost = host ?? getWebsocketUrlFromLocation()
    log("start connecting to", wsHost)
    const socket = io(wsHost, options)
    // transports: ["websocket"],
    // reconnection: true,
    // reconnectionDelay: 1000,
    // reconnectionDelayMax: 3000,
    // reconnectionAttempts: Infinity,
    const conn = new ZSocketIOConnection(socket)

    // let didResolve = false
    socket.on("connect", () => {
      log(`on connect`)
      //   if (!didResolve) resolve(conn)
      //   didResolve = true
    })

    socket.on("error", (err) => {
      log(`on error:`, err)
      // conn.close()
    })

    socket.on("disconnect", (err) => {
      log(`on disconnect:`, err)
      // socket.close()
      // socket.open()
    })
    return conn
  }

  // static async broadcast<U extends keyof ZSocketIOEvents>(
  //   connections: Connection[],
  //   event: U,
  //   ...args: Parameters<ZSocketIOEvents[U]>
  // ): Promise<void> {
  //   await Promise.all(connections.map((conn) => conn.emit(event, ...args)))
  // }
}
