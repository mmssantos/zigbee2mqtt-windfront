import type { useAppDispatch } from "../hooks/store.js";
import store, { clearLogs as clearStateLogs } from "../store.js";
import { download } from "../utils.js";

export async function exportState(): Promise<void> {
    return await download(store.getState() as unknown as Record<string, unknown>, "state.json");
}

export async function clearLogs(dispatch: ReturnType<typeof useAppDispatch>): Promise<void> {
    dispatch(clearStateLogs());
    await Promise.resolve();
}
