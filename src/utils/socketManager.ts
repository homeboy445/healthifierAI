import { io, Socket } from "socket.io-client";
import { getAuthTokens, removeAuthTokens } from "./Auth";
import { ChatData } from "../types/types";

const channelStore = {
  HEALTH_CHAT: {
    REQUEST: "health_chat.server.request",
    RESPONSE: "health_chat.server.response",
    END_CHAT: "health_chat.server.end_chat",
  },
  AUTH: {
    UNAUTHORIZED: "UNAUTHORIZED",
  }
};

class SocketManager {
  private socket!: Socket; // Adjust the server URL as needed

  private chatConfig = {
    onRecieveCallback: (message: ChatData) => {},
  }

  isConnected = false;

  connect() {
    if (this.isConnected) {
        return;
    }
    this.socket = io("http://localhost:3010", {
        query: {
            accessToken: getAuthTokens().accessToken
        }
    });
    this.socket.on("connect", () => {
        console.log("socket connected!");
    });
    this.socket.on("disconnect", () => {
        this.isConnected = false;
        console.log("socket disconnected!");
    });
    this.socket.on('error', (e) => {
        console.log("Some error ocurred in socket connection:", e);
    });
    this.socket.on(channelStore.AUTH.UNAUTHORIZED, () => {
        console.log("Unauthorized access detected. Please login again!");
        removeAuthTokens();
        window.location.href = "/";
    });
    this.isConnected = true;
  }

  disconnect() {
    this.socket.disconnect();
    this.isConnected = false;
  }

  get chatHandler() {
    this.connect();
    this.socket.on(channelStore.HEALTH_CHAT.REQUEST, (message) => {
        this.chatConfig.onRecieveCallback(message);
    });
    return {
        onReceive: (callback: (message: ChatData) => void) => {
            this.chatConfig.onRecieveCallback = callback;
        },
        sendMessage: (message: ChatData | {}, closeChat = false) => {
          if (closeChat) {
            return this.socket.emit(channelStore.HEALTH_CHAT.END_CHAT, {});
          }
          this.socket.emit(channelStore.HEALTH_CHAT.RESPONSE, message);
        }
    }
  }
}

const socketManager = new SocketManager();

export default socketManager;
