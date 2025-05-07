import type { JSX } from "react";
import type { Device } from "../../types.js";
import Button from "../Button.js";

import NiceModal from "@ebay/nice-modal-react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { RenameDeviceModal } from "../modal/components/RenameDeviceModal.js";

interface DeviceControlEditNameProps {
    device: Device;
    renameDevice(old: string, newName: string, homeassistantRename: boolean): Promise<void>;
    homeassistantEnabled: boolean;
    style: string;
}

export const DeviceControlEditName = (props: DeviceControlEditNameProps): JSX.Element => {
    const { homeassistantEnabled, device, renameDevice, style } = props;
    const { t } = useTranslation("zigbee");

    return (
        <Button<undefined>
            className={`btn ${style}`}
            onClick={() =>
                NiceModal.show(RenameDeviceModal, {
                    device,
                    renameDevice,
                    homeassistantEnabled,
                })
            }
            title={t("rename_device")}
        >
            <FontAwesomeIcon icon={faEdit} />
        </Button>
    );
};
