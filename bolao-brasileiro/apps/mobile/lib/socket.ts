import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@bolao/shared-types";
import { API_URL } from "./api";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

/** Conexão única (singleton) com o servidor de tempo real. */
export function getSocket() {
  if (!socket) {
    socket = io(API_URL, { transports: ["websocket"], autoConnect: true });
  }
  return socket;
}
