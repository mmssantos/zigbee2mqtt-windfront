import type { JSX } from "react";
import type { Device } from "../../types.js";
import Button from "../button/Button.js";

import NiceModal from "@ebay/nice-modal-react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { UpdateDeviceDescModal } from "../modal/components/EditDeviceDescModal.js";

interface DeviceControlUpdateDescProps {
    device: Device;
    setDeviceDescription(old: string, newDesc: string): Promise<void>;
}

export const DeviceControlUpdateDesc = (props: DeviceControlUpdateDescProps): JSX.Element => {
    const { device, setDeviceDescription } = props;
    const { t } = useTranslation(["zigbee"]);

    return (
        <Button<void>
            className="btn btn-link btn-sm btn-square"
            onClick={() =>
                NiceModal.show(UpdateDeviceDescModal, {
                    device,
                    setDeviceDescription,
                })
            }
            title={t("edit_description")}
        >
            <FontAwesomeIcon icon={faEdit} />
        </Button>
    );
};
