import { useAppSelector } from "../../hooks/useApp.js";
import type { Device } from "../../types.js";
import { AddScene } from "./AddScene.js";
import { RecallRemove } from "./RecallRemove.js";

type SceneProps = {
    device: Device;
};

export function ScenePage(props: SceneProps) {
    const deviceState = useAppSelector((state) => state.deviceStates[props.device.friendly_name] ?? {});

    return (
        <div className="flex flex-col gap-3">
            <AddScene target={props.device} deviceState={deviceState} />
            <RecallRemove target={props.device} deviceState={deviceState} />
        </div>
    );
}
