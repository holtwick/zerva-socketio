import { lazyListener } from "zeed"
import { io } from "socket.io-client"
import { ZSocketIOConnection } from "./index"

// npx jest src/simple.spec.ts --detectOpenHandles

const url = `ws://localhost:${8080}`

describe("Socket", () => {
  it("should connect", async () => {
    const socket = io(url, {
      reconnectionDelayMax: 3000,
      transports: ["websocket"],
    })
    expect(socket).not.toBeNull()
    let onPong = lazyListener(socket, "serverPong")

    socket.emit("serverPing", { echo: "echo123" })
    socket.emit("serverPing", { echo: "echo987" })

    expect(await onPong()).toEqual({ echo: "echo123" })
    expect(await onPong()).toEqual({ echo: "echo987" })

    socket.close()
  })

  it("should connect typed", async () => {
    const socket = io(url, {
      reconnectionDelayMax: 3000,
      transports: ["websocket"],
    })
    expect(socket).not.toBeNull()

    const conn = new ZSocketIOConnection(socket)

    let res = await conn.emit("serverPing", { echo: "echo123" })
    expect(res).toEqual({ echo: "echo123" })

    socket.close()
  })
})
