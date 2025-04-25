import { useAppDispatch, useAppSelector } from "../hooks/store.js";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { type Extension, setExtensions } from "../store.js";

export async function updateExtensionCode(dispatch: ReturnType<typeof useAppDispatch>, extension: Extension): Promise<void> {
    const extensions = useAppSelector((state) => state.extensions);
    const newExtensions = extensions.filter((f) => f.name !== extension.name).concat([extension]);
    dispatch(setExtensions(newExtensions));

    await Promise.resolve();
}

export async function saveExtensionCode(sendMessage: ApiSendMessage, extension: Extension): Promise<void> {
    await sendMessage("bridge/request/extension/save", extension);
}

export async function removeExtension(sendMessage: ApiSendMessage, extension: Extension): Promise<void> {
    const extensions = useAppSelector((state) => state.extensions);
    const newExtensions = extensions.filter((f) => f.name !== extension.name);
    const dispatch = useAppDispatch();
    dispatch(setExtensions(newExtensions));

    await sendMessage("bridge/request/extension/remove", { name: extension.name });
}
