import { io } from "socket.io-client"
import { ZSocketIOConnection } from "./index"
import { lazyListener, Logger, LoggerNodeHandler, LogLevel } from "zeed"
import { useHttp, serve, emit } from "zerva"
import { useSocketIO } from "./module"

Logger.setHandlers([
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
    nameBrackets: false,
    levelHelper: false,
  }),
])

const port = 8888
const url = `ws://localhost:${port}`

describe("Socket", () => {
  beforeAll(async () => {
    useHttp({ port })
    useSocketIO({})
    await serve()
  })

  afterAll(async () => {
    await emit("serveStop")
  })

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
