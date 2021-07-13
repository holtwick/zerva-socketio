import { ZSocketIOConnection } from "./connection"

export {}

declare global {
  interface ZContextEvents {
    socketIOConnect(conn: ZSocketIOConnection): void
    socketIODisconnect(conn: ZSocketIOConnection, error?: string): void
  }

  interface ZSocketIOEvents {
    serverPing(data: any): any
    serverPong(data: any): any
    serverConfig(): any
  }
}
