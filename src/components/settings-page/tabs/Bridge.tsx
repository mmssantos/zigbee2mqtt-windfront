import { useAppSelector } from "../../../hooks/useApp.js";

export default function Bridge() {
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const jsonState = JSON.stringify(bridgeInfo, null, 4);
    const lines = Math.max(10, (jsonState.match(/\n/g) || "").length + 1);

    return <textarea className="textarea w-full" readOnly rows={lines} defaultValue={jsonState} />;
}
