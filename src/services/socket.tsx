import { io } from "socket.io-client";

export const socket = io("http://10.135.171.136:5000", {
  transports: ["websocket"]
});
