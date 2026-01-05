import type { Db } from "mongodb"

declare global {
  var mongo: {
    conn: Db | null
    promise: Promise<Db> | null
  }
}
