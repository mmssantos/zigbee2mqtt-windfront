import type { JSX } from "react";
import { type Device, type DeviceState, InterviewState } from "../../types.js";
import Button from "../button/Button.js";

import NiceModal from "@ebay/nice-modal-react";
import { faInfo, faRetweet, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { RemoveDeviceModal } from "../modal/components/RemoveDeviceModal.js";
import { DeviceControlEditName } from "./DeviceControlEditName.js";

interface DeviceControlGroupProps {
    device: Device;
    state?: DeviceState;
    homeassistantEnabled: boolean;
    renameDevice: (from: string, to: string, homeassistantRename: boolean) => Promise<void>;
    configureDevice: (id: string) => Promise<void>;
    interviewDevice: (id: string) => Promise<void>;
    removeDevice: (id: string, force: boolean, block: boolean) => Promise<void>;
}

export default function DeviceControlGroup(props: DeviceControlGroupProps): JSX.Element {
    const { device, state, renameDevice, configureDevice, interviewDevice, removeDevice } = props;
    const { t } = useTranslation("zigbee");
    const disableInterview =
        device.interview_state === InterviewState.InProgress ||
        device.interview_state === InterviewState.Pending ||
        (state && state.update?.state === "updating");

    return (
        <div className="join">
            <DeviceControlEditName
                device={device}
                renameDevice={renameDevice}
                homeassistantEnabled={props.homeassistantEnabled}
                style="btn-primary join-item btn-square"
            />
            <Button<string>
                className="btn btn-warning join-item btn-square"
                onClick={configureDevice}
                item={device.ieee_address}
                title={t("reconfigure")}
                prompt
                disabled={disableInterview}
            >
                <FontAwesomeIcon icon={faRetweet} />
            </Button>
            <Button<string>
                className="btn btn-info join-item btn-square"
                onClick={interviewDevice}
                item={device.ieee_address}
                title={t("interview")}
                prompt
                disabled={disableInterview}
            >
                <FontAwesomeIcon icon={faInfo} />
            </Button>
            <Button<void>
                onClick={() => NiceModal.show(RemoveDeviceModal, { device, removeDevice })}
                className="btn btn-error join-item btn-square"
                title={t("remove_device")}
            >
                <FontAwesomeIcon icon={faTrash} />
            </Button>
        </div>
    );
}
