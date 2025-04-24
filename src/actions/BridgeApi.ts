import type { useDispatch } from "react-redux";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { setBackupPreparing } from "../store.js";
import type { Device } from "../types.js";

export async function setPermitJoin(sendMessage: ApiSendMessage, time = 254, device?: Device): Promise<void> {
    await sendMessage("bridge/request/permit_join", { time, device: device?.friendly_name });
}

export async function updateBridgeConfig(sendMessage: ApiSendMessage, options: unknown): Promise<void> {
    await sendMessage("bridge/request/options", { options });
}

export async function restartBridge(sendMessage: ApiSendMessage): Promise<void> {
    await sendMessage("bridge/request/restart", {});
}

export async function requestBackup(sendMessage: ApiSendMessage, dispatch: ReturnType<typeof useDispatch>): Promise<void> {
    dispatch(setBackupPreparing());
    await sendMessage("bridge/request/backup", {});
}

export async function addInstallCode(sendMessage: ApiSendMessage, installCode: string): Promise<void> {
    await sendMessage("bridge/request/install_code/add", { value: installCode });
    await setPermitJoin(sendMessage, 254);
}
