import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Device } from "../../../types.js";

import NiceModal, { useModal } from "@ebay/nice-modal-react";

import Button from "../../button/Button.js";
import Modal from "../Modal.js";

export type RenameActionProps = {
    device: Device;
    homeassistantEnabled: boolean;

    renameDevice(old: string, newName: string, homeassistantRename: boolean): Promise<void>;
    setDeviceDescription(friendlyName: string, description: string): Promise<void>;
};
export const UpdateDeviceDescModal = NiceModal.create((props: RenameActionProps): JSX.Element => {
    const modal = useModal();
    const { device, setDeviceDescription } = props;
    const [description, setDescription] = useState(device.description || "");
    const { t } = useTranslation(["zigbee", "common"]);

    const onSaveDescriptionClick = async (): Promise<void> => {
        modal.remove();
        await setDeviceDescription(device.friendly_name, description);
    };
    const renderFooter = () => (
        <>
            <Button className="btn btn-secondary" onClick={modal.remove}>
                {t("common:close")}
            </Button>
            <Button className="btn btn-primary ms-1" onClick={onSaveDescriptionClick}>
                {t("zigbee:save_description")}
            </Button>
        </>
    );

    return (
        <Modal isOpen={modal.visible} title={`${t("update_description")} ${device.friendly_name}`} footer={renderFooter()}>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">{t("description")}</legend>
                <textarea className="textarea h-24" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </fieldset>
        </Modal>
    );
});
