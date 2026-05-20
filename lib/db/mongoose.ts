import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing environment variable: MONGODB_URI");
  }
  return uri;
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const globalCache = globalThis.__mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.__mongooseCache = globalCache;

/**
 * Reusable cached Mongoose connection.
 *
 * Notes:
 * - Intended for the Node.js runtime (not Edge).
 * - Safe in Next.js dev (hot reload) by caching on globalThis.
 */
export async function connectMongoose() {
  if (globalCache.conn) return globalCache.conn;

  if (!globalCache.promise) {
    const uri = getMongoUri();
    globalCache.promise = mongoose
      .connect(uri, {
        // Keep config minimal; override via env if needed.
        bufferCommands: false,
      })
      .then((m) => m);
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}

