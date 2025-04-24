import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Endpoint } from "../types.js";

export async function createGroup(sendMessage: ApiSendMessage, group: string, id?: number): Promise<void> {
    const payload = { friendly_name: group };

    if (id !== undefined) {
        payload.id = id;
    }

    await sendMessage("bridge/request/group/add", payload);
}

export async function removeGroup(sendMessage: ApiSendMessage, group: string): Promise<void> {
    await sendMessage("bridge/request/group/remove", { id: group });
}

export async function addDeviceToGroup(sendMessage: ApiSendMessage, device: string, endpoint: Endpoint, group: string): Promise<void> {
    await sendMessage("bridge/request/group/members/add", { group, endpoint, device });
}

export async function removeDeviceFromGroup(sendMessage: ApiSendMessage, device: string, endpoint: Endpoint, group: string): Promise<void> {
    await sendMessage("bridge/request/group/members/remove", { device, endpoint, group });
}

export async function renameGroup(sendMessage: ApiSendMessage, oldName: string, newName: string): Promise<void> {
    await sendMessage("bridge/request/group/rename", { from: oldName, to: newName });
}
