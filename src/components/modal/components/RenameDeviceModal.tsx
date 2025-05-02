import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Device } from "../../../types.js";

import NiceModal, { useModal } from "@ebay/nice-modal-react";

import Button from "../../button/Button.js";
import CheckboxField from "../../form-fields/CheckboxField.js";
import InputField from "../../form-fields/InputField.js";
import Modal from "../Modal.js";

export type RenameActionProps = {
    device: Device;
    homeassistantEnabled: boolean;
    renameDevice(old: string, newName: string, homeassistantRename: boolean): Promise<void>;
};
export const RenameDeviceModal = NiceModal.create((props: RenameActionProps): JSX.Element => {
    const { homeassistantEnabled, device, renameDevice } = props;
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const [isHASSRename, setIsHASSRename] = useState(false);
    const [friendlyName, setFriendlyName] = useState(device.friendly_name);

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("rename_device")} ${device.friendly_name}`}
            footer={
                <>
                    <Button className="btn btn-secondary" onClick={modal.remove}>
                        {t("common:close")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async () => {
                            modal.remove();
                            await renameDevice(device.friendly_name, friendlyName, isHASSRename);
                        }}
                    >
                        {t("zigbee:rename_device")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <InputField
                    name="friendly_name"
                    label={t("friendly_name")}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    defaultValue={friendlyName}
                    type="text"
                    required
                />
                {homeassistantEnabled && (
                    <CheckboxField
                        label={t("update_Home_assistant_entity_id")}
                        name="update_Home_assistant_entity_id"
                        onChange={(e) => setIsHASSRename(e.target.checked)}
                        defaultChecked={isHASSRename}
                    />
                )}
            </div>
        </Modal>
    );
});
