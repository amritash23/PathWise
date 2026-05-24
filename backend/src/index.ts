import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { createApp } from "./server";
import { connectToDatabase } from "./db";
import { env } from "./config/env";

async function main() {
  await connectToDatabase(env.MONGODB_URI);

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[backend] listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[backend] fatal error", err);
  process.exit(1);
});
