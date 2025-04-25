import type { useAppDispatch } from "../hooks/store.js";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { setBackupPreparing } from "../store.js";
import type { Device } from "../types.js";

export async function permitJoin(sendMessage: ApiSendMessage, time = 254, device?: Device): Promise<void> {
    await sendMessage("bridge/request/permit_join", { time, device: device?.friendly_name });
}

export async function setOptions(sendMessage: ApiSendMessage, options: unknown): Promise<void> {
    await sendMessage("bridge/request/options", { options });
}

export async function restart(sendMessage: ApiSendMessage): Promise<void> {
    await sendMessage("bridge/request/restart", {});
}

export async function backup(sendMessage: ApiSendMessage, dispatch: ReturnType<typeof useAppDispatch>): Promise<void> {
    dispatch(setBackupPreparing());
    await sendMessage("bridge/request/backup", {});
}

export async function addInstallCode(sendMessage: ApiSendMessage, installCode: string): Promise<void> {
    await sendMessage("bridge/request/install_code/add", { value: installCode });
    await permitJoin(sendMessage, 254);
}
