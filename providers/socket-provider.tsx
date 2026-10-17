"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import { disconnectSocketClient, getSocketClient } from "@/lib/socket/socket-client";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  workspaceId?: string;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId?: string;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = getSocketClient();
    if (!socketInstance) return;

    const onConnect = () => {
      setIsConnected(true);
      console.log("[Socket.IO Client] Connected to real-time server.");
      if (workspaceId) {
        socketInstance.emit("join-workspace", workspaceId);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log("[Socket.IO Client] Disconnected from real-time server.");
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    if (socketInstance.connected) {
      setIsConnected(true);
      if (workspaceId) {
        socketInstance.emit("join-workspace", workspaceId);
      }
    }

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      if (workspaceId && socketInstance.connected) {
        socketInstance.emit("leave-workspace", workspaceId);
      }
      disconnectSocketClient();
    };
  }, [workspaceId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, workspaceId }}>
      {children}
    </SocketContext.Provider>
  );
};
