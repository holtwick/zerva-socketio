// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, emit, register, onInit, requireModules } from "zerva"
import { Server, Socket } from "socket.io"
import { ZSocketIOConnection } from "./connection-node"

const name = "socketio"
const log = Logger(name)

interface ZSocketIOConfig {}

export function useSocketIO(config: ZSocketIOConfig = {}) {
  log("setup")

  register(name)

  onInit(() => {
    requireModules("http")
  })

  on("httpInit", ({ http }) => {
    log("init")

    let io = new Server(http, {
      serveClient: false,
      cors: {
        origin: "*",
        methods: ["GET", "PUT", "POST"],
      },
    })

    io.on("connection", (socket: Socket) => {
      // Socket ID first, to have ahomegenous coloring
      const log = Logger(`${socket?.id?.substr(0, 6)}:${name}`)
      log.info("connection", socket.id)
      let conn = new ZSocketIOConnection(socket)

      // socket.onAny((name: string, msg: any) => {
      //   log(`on '${name}':`, JSON.stringify(msg).substr(0, 40))
      // })

      conn.on("serverPing", (data) => {
        conn.emit("serverPong", data)
        return data
      })

      conn.on("serverConfig", () => config)

      socket.on("disconnect", () => {
        log.info("user disconnected")
        emit("socketIODisconnect", conn)
      })

      socket.on("error", () => {
        log.error("error")
        emit("socketIODisconnect", conn, "error")
      })

      emit("socketIOConnect", conn)
    })
  })
}
