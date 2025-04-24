import type { useDispatch } from "react-redux";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { setTouchlinkIdentifyInProgress, setTouchlinkResetInProgress, setTouchlinkScan } from "../store.js";

export async function touchlinkScan(sendMessage: ApiSendMessage, dispatch: ReturnType<typeof useDispatch>): Promise<void> {
    dispatch(setTouchlinkScan({ inProgress: true, devices: [] }));
    await sendMessage("bridge/request/touchlink/scan", { value: true });
}

export async function touchlinkIdentify(
    sendMessage: ApiSendMessage,
    dispatch: ReturnType<typeof useDispatch>,
    device: Record<string, unknown>,
): Promise<void> {
    dispatch(setTouchlinkIdentifyInProgress(true));
    await sendMessage("bridge/request/touchlink/identify", device);
}

export async function touchlinkReset(
    sendMessage: ApiSendMessage,
    dispatch: ReturnType<typeof useDispatch>,
    device: Record<string, unknown>,
): Promise<void> {
    dispatch(setTouchlinkResetInProgress(true));
    await sendMessage("bridge/request/touchlink/factory_reset", device);
}
