import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Endpoint, ReportingConfig } from "../types.js";

export async function configureReport(sendMessage: ApiSendMessage, device: string, endpoint: Endpoint, config: ReportingConfig): Promise<void> {
    await sendMessage("bridge/request/device/configure_reporting", {
        id: device,
        endpoint,
        ...config,
    });
}
