import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Device, Endpoint } from "../types.js";

export async function configureReport(
    sendMessage: ApiSendMessage,
    device: string,
    endpoint: Endpoint,
    config: Device["endpoints"][number]["configured_reportings"][number],
): Promise<void> {
    await sendMessage("bridge/request/device/configure_reporting", {
        id: device,
        endpoint,
        ...config,
    });
}
