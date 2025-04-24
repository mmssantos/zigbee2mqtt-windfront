import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Cluster, Endpoint } from "../types.js";

export type BindParams = {
    from: string;
    from_endpoint: Endpoint;
    to: string;
    to_endpoint?: Endpoint;
    clusters: Cluster[];
};

type BindOperation = "bind" | "unbind";

const bindOp = async (sendMessage: ApiSendMessage, operation: BindOperation, params: Record<string, unknown>) => {
    await sendMessage(`bridge/request/device/${operation}`, params);
};

export async function addBind(sendMessage: ApiSendMessage, params: BindParams): Promise<void> {
    await bindOp(sendMessage, "bind", params);
}

export async function removeBind(sendMessage: ApiSendMessage, params: BindParams): Promise<void> {
    await bindOp(sendMessage, "unbind", params);
}
