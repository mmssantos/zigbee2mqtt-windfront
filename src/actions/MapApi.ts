import type { useDispatch } from "react-redux";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { setNetworkGraphIsLoading } from "../store.js";

export async function networkMapRequest(sendMessage: ApiSendMessage, dispatch: ReturnType<typeof useDispatch>): Promise<void> {
    dispatch(setNetworkGraphIsLoading());
    await sendMessage("bridge/request/networkmap", { type: "raw", routes: false });
}
