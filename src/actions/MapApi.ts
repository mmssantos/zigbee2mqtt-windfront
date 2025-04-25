import type { useAppDispatch } from "../hooks/store.js";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { setNetworkGraphIsLoading } from "../store.js";

export async function networkMapRequest(sendMessage: ApiSendMessage, dispatch: ReturnType<typeof useAppDispatch>): Promise<void> {
    dispatch(setNetworkGraphIsLoading());
    await sendMessage("bridge/request/networkmap", { type: "raw", routes: false });
}
