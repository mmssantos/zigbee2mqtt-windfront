import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device } from "../../../types.js";

type StatesProps = { device: Device };

export default function State(props: StatesProps) {
    const { device } = props;
    const deviceState = useAppSelector((state) => state.deviceStates[device.friendly_name] ?? {});
    const jsonState = JSON.stringify(deviceState, null, 4);
    const lines = Math.max(10, (jsonState.match(/\n/g) || "").length + 1);

    return <textarea className="textarea w-full" rows={lines} readOnly value={jsonState} />;
}
