import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import type { Scene } from "../types.js";

export type SceneId = number;
// Document: https://www.zigbee2mqtt.io/guide/usage/scenes.html

export async function sceneStore(sendMessage: ApiSendMessage, dev: string, scene: Scene, groupId?: number): Promise<void> {
    const payload: Record<string, unknown> = { ID: scene.id };

    if (scene.name) {
        payload.name = scene.name;
    }

    if (groupId !== undefined) {
        payload.group_id = groupId;
    }

    await sendMessage(`${dev}/set`, { scene_store: payload });
}

export async function sceneRecall(sendMessage: ApiSendMessage, dev: string, sceneId: SceneId): Promise<void> {
    await sendMessage(`${dev}/set`, { scene_recall: sceneId });
}

export async function sceneRemove(sendMessage: ApiSendMessage, dev: string, sceneId: SceneId): Promise<void> {
    await sendMessage(`${dev}/set`, { scene_remove: sceneId });
}

export async function sceneRemoveAll(sendMessage: ApiSendMessage, dev: string): Promise<void> {
    await sendMessage(`${dev}/set`, { scene_remove_all: "" });
}
