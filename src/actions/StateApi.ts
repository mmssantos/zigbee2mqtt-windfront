import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";

// export async function setStateValue(
//     sendMessage: ApiSendMessage,
//     friendlyName: FriendlyName,
//     name: string,
//     value: string | number | boolean,
// ): Promise<void> {
//     await sendMessage(`${friendlyName}/set`, { [name]: value });
// }

export async function setDeviceState(sendMessage: ApiSendMessage, friendlyName: string, value: Record<string, unknown>): Promise<void> {
    await sendMessage(`${friendlyName}/set`, value);
}

export async function getDeviceState(sendMessage: ApiSendMessage, friendlyName: string, value: Record<string, unknown>): Promise<void> {
    await sendMessage(`${friendlyName}/get`, value);
}
