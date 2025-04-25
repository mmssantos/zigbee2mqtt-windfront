import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Cluster, Endpoint } from "../types.js";

export type BindParams = {
    from: string;
    from_endpoint: Endpoint;
    to: string;
    to_endpoint?: Endpoint;
    clusters: Cluster[];
};

export async function bind(sendMessage: ApiSendMessage, params: BindParams): Promise<void> {
    await sendMessage("bridge/request/device/bind", params);
}

export async function unbind(sendMessage: ApiSendMessage, params: BindParams): Promise<void> {
    await sendMessage("bridge/request/device/unbind", params);
}
