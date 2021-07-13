// <reference path="node_modules/zerva-module-template/dist/esm/index.d.ts" />

// Simple demo for node and CommonJS loading

import {
  Logger,
  LoggerFileHandler,
  LoggerNodeHandler,
  LogLevel,
  valueToInteger,
} from "zeed"

Logger.setHandlers([
  LoggerFileHandler("zerva.log", {
    level: LogLevel.debug,
  }),
  LoggerNodeHandler({
    level: LogLevel.info,
    filter: "*",
    colors: true,
    padding: 16,
    nameBrackets: false,
    levelHelper: false,
  }),
])

const log = Logger("app")

import { serve, useHttp } from "zerva"
import { useSocketIO } from "zerva-socketio"

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

useSocketIO()

serve()
