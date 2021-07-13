// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, emit, register } from "zerva"

const name = "counter"
const log = Logger(`zerva:${name}`)

declare global {
  interface ZContextEvents {
    counterIncrement(counter: number): void
  }
}

export function useCounter() {
  log.info("use counter")
  register("counter", ["http"])
  let counter = 0
  on("httpInit", ({ get }) => {
    get("/", async () => {
      await emit("counterIncrement", ++counter)
      return `Counter ${counter}.<br><br>Reload page to increase counter.`
    })
  })
}
