import type { PropsWithChildren } from "react";
import { WebSocketApiRouterContext } from "./WebSocketApiRouterContext.js";
import { useApiWebSocket } from "./hooks/useApiWebSocket.js";

export function WebSocketApiRouter({ children }: PropsWithChildren) {
    const webSocket = useApiWebSocket();

    return <WebSocketApiRouterContext.Provider value={webSocket}>{children}</WebSocketApiRouterContext.Provider>;
}
