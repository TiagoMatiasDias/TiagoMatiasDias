import { createServer } from "node:http";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@bolao/shared-types";
import { createApp } from "./app.js";
import { env } from "./env.js";
import { startLiveEngine } from "./liveEngine.js";

const app = createApp();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: env.CORS_ORIGIN },
});

io.on("connection", (socket) => {
  socket.on("subscribe:match", (matchId) => {
    socket.join(`match:${matchId}`);
  });
  socket.on("subscribe:leaderboard", (poolId) => {
    socket.join(`leaderboard:${poolId ?? "global"}`);
  });
});

const liveProvider = startLiveEngine(io);

httpServer.listen(env.PORT, () => {
  console.log(`Bolão backend rodando em http://localhost:${env.PORT}`);
});

function shutdown() {
  liveProvider.stop();
  httpServer.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
