import { WebSocketApiRouterContext } from "./WebSocketApiRouterContext.js";
import { useApiWebSocket } from "./hooks/useApiWebSocket.js";

export function WebSocketApiRouter({ children }) {
    const webSocket = useApiWebSocket();

    return <WebSocketApiRouterContext.Provider value={webSocket}>{children}</WebSocketApiRouterContext.Provider>;
}
