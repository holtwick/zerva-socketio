import { empty, Logger, LoggerInterface, promisify } from "zeed"
import { Socket, ManagerOptions, SocketOptions } from "socket.io-client"
import io from "socket.io-client"

import "./types"

const logName = "ws-client"
const log = Logger(logName)

export const getWebsocketUrlFromLocation = () =>
  "ws" + location.protocol.substr(4) + "//" + location.host

export class ZSocketIOConnection {
  private socket?: Socket
  private log: LoggerInterface = log

  constructor(socket: Socket) {
    this.socket = socket

    if (this.socket?.id) {
      this.log = Logger(`${this.socket?.id?.substr(0, 6)}:${logName}`)
    }

    // let didResolve = false
    socket.on("connect", () => {
      this.log = Logger(`${this.socket?.id?.substr(0, 6)}:${logName}`)
      this.log(`on connect`)
      //   if (!didResolve) resolve(conn)
      //   didResolve = true
    })

    socket.on("error", (err) => {
      this.log(`on error:`, err)
      // conn.close()
    })

    socket.on("disconnect", (err) => {
      this.log(`on disconnect:`, err)
      // socket.close()
      // socket.open()
    })

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
      this.log(`emit(${event})`, args)
      this.socket?.emit(event, args[0], (value: any) => {
        this.log(`response for emit(${event}) =`, value)
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
        this.log(`on(${event})`, data)
        let result = await promisify(listener(data))
        this.log(`our resonse on(${event})`, result)
        if (callback) callback(result)
      } catch (err: any) {
        this.log.warn(`warnung on(${event})`, err)
        if (callback) callback({ error: err.message })
      }
    })
  }

  onAny(fn: any) {
    this.socket?.onAny((...args) => {
      this.log("onAny", ...args)
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
    const socket = io(wsHost, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: Infinity,
      ...options,
    })

    const conn = new ZSocketIOConnection(socket)

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
