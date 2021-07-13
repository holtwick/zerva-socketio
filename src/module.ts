// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, emit, register } from "zerva"
import { Server, Socket } from "socket.io"
import { ZSocketIOConnection } from "./connection"

const name = "socketio"
const log = Logger(`zerva:${name}`)

export function useSocketIO(config: any) {
  register(name, ["http"])

  on("httpInit", ({ http }) => {
    let io = new Server(http, {
      serveClient: false,
      cors: {
        origin: "*",
        methods: ["GET", "PUT", "POST"],
      },
    })

    io.on("connection", (socket: Socket) => {
      const log = Logger(`${name}:${socket?.id?.substr(0, 6)}`)
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
