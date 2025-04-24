import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";

export async function checkOTA(sendMessage: ApiSendMessage, deviceName: string): Promise<void> {
    await sendMessage("bridge/request/device/ota_update/check", { id: deviceName });
}

export async function scheduleOTA(sendMessage: ApiSendMessage, deviceName: string): Promise<void> {
    await sendMessage("bridge/request/device/ota_update/schedule", { id: deviceName });
}

export async function unscheduleOTA(sendMessage: ApiSendMessage, deviceName: string): Promise<void> {
    await sendMessage("bridge/request/device/ota_update/unschedule", { id: deviceName });
}

export async function updateOTA(sendMessage: ApiSendMessage, deviceName: string): Promise<void> {
    await sendMessage("bridge/request/device/ota_update/update", { id: deviceName });
}
