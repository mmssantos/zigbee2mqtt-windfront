import type { Device, DeviceState } from "../../types.js";
import { AddScene } from "./AddScene.js";
import { RecallRemove } from "./RecallRemove.js";

type SceneProps = {
    device: Device;
    deviceState: DeviceState;
};

export function ScenePage(props: SceneProps) {
    const { device, deviceState } = props;

    return (
        <div className="row">
            <div className="col-12 col-sm-6 col-xxl-6 d-flex">
                <div className="card flex-fill">
                    <div className="card-body py-4">
                        <AddScene target={device} deviceState={deviceState} />
                    </div>
                </div>
            </div>

            <div className="col-12 col-sm-6 col-xxl-6 d-flex">
                <div className="card flex-fill">
                    <div className="card-body py-4">
                        <RecallRemove target={device} deviceState={deviceState} />
                    </div>
                </div>
            </div>
        </div>
    );
}
