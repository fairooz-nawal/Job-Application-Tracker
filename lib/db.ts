import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

let cached = global.mongo

if (!cached) {
  cached = global.mongo = { conn: null, promise: null }
}

async function dbConnect(): Promise<Db> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {}

    cached.promise = MongoClient.connect(MONGODB_URI!, opts).then((client) => {
      console.log("[v0] Connected to MongoDB")
      return client.db()
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
