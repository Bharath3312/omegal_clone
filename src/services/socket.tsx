import { io } from "socket.io-client";

export const socket = io("https://signaling-server-7abi.onrender.com", {
  transports: ["websocket"]
});
