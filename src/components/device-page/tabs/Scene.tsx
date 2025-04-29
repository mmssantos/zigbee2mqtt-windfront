import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device } from "../../../types.js";
import { AddScene } from "../AddScene.js";
import { RecallRemove } from "../RecallRemove.js";

type SceneProps = {
    device: Device;
};

export function Scene(props: SceneProps) {
    const deviceState = useAppSelector((state) => state.deviceStates[props.device.friendly_name] ?? {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-3 my-2">
            <div>
                <AddScene target={props.device} deviceState={deviceState} />
            </div>
            <div>
                <RecallRemove target={props.device} deviceState={deviceState} />
            </div>
        </div>
    );
}
