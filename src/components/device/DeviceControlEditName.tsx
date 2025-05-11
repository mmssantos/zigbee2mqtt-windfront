import NiceModal from "@ebay/nice-modal-react";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button.js";
import { RenameDeviceModal } from "../modal/components/RenameDeviceModal.js";

interface DeviceControlEditNameProps {
    name: string;
    renameDevice(old: string, newName: string, homeassistantRename: boolean): Promise<void>;
    homeassistantEnabled: boolean;
    style: string;
}

const DeviceControlEditName = memo((props: DeviceControlEditNameProps) => {
    const { homeassistantEnabled, name, renameDevice, style } = props;
    const { t } = useTranslation("zigbee");

    return (
        <Button<undefined>
            className={`btn ${style}`}
            onClick={async () =>
                await NiceModal.show(RenameDeviceModal, {
                    name,
                    renameDevice,
                    homeassistantEnabled,
                })
            }
            title={t("rename_device")}
        >
            <FontAwesomeIcon icon={faEdit} />
        </Button>
    );
});

export default DeviceControlEditName;
