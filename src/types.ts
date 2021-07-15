// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

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
