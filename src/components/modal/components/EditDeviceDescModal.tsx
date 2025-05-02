import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Device } from "../../../types.js";

import NiceModal, { useModal } from "@ebay/nice-modal-react";

import Button from "../../button/Button.js";
import TextareaField from "../../form-fields/TextareaField.js";
import Modal from "../Modal.js";

export type RenameActionProps = {
    device: Device;
    homeassistantEnabled: boolean;

    renameDevice(old: string, newName: string, homeassistantRename: boolean): Promise<void>;
    setDeviceDescription(friendlyName: string, description: string): Promise<void>;
};
export const UpdateDeviceDescModal = NiceModal.create((props: RenameActionProps): JSX.Element => {
    const { device, setDeviceDescription } = props;
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const [description, setDescription] = useState(device.description || "");

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("update_description")} ${device.friendly_name}`}
            footer={
                <>
                    <Button className="btn btn-secondary" onClick={modal.remove}>
                        {t("common:close")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async () => {
                            modal.remove();
                            await setDeviceDescription(device.ieee_address, description);
                        }}
                    >
                        {t("zigbee:save_description")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <TextareaField label={t("description")} name="update_description" onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
        </Modal>
    );
});
