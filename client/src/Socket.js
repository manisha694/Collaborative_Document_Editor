import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const options = {
  'force new connection': true,
  reconnectionAttempts: Infinity,  // should be a number, not string
  timeout: 10000,
  transports: ['websocket'],
};

export const initSocket = async () => {
  return io(SOCKET_URL, options);
};
