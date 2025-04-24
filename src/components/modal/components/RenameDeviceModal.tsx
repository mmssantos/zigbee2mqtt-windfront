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
};
export const RenameDeviceModal = NiceModal.create((props: RenameActionProps): JSX.Element => {
    const modal = useModal();
    const { homeassistantEnabled, device, renameDevice } = props;
    const [isHASSRename, setIsHASSRename] = useState(false);
    const [friendlyName, setFriendlyName] = useState(device.friendly_name);
    const { t } = useTranslation(["zigbee", "common"]);

    const onRenameClick = async (): Promise<void> => {
        modal.remove();
        await renameDevice(device.friendly_name, friendlyName, isHASSRename);
    };
    const renderFooter = () => (
        <>
            <Button className="btn btn-secondary" onClick={modal.remove}>
                {t("common:close")}
            </Button>
            <Button className="btn btn-primary ms-1" onClick={onRenameClick}>
                {t("zigbee:rename_device")}
            </Button>
        </>
    );

    return (
        <Modal isOpen={modal.visible} title={`${t("rename_device")} ${device.friendly_name}`} footer={renderFooter()}>
            <div className="flex flex-col gap-2">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("friendly_name")}</legend>
                    <input type="text" className="input" value={friendlyName} onChange={(e) => setFriendlyName(e.target.value)} />
                </fieldset>
                {homeassistantEnabled && (
                    <label className="label" key="force">
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            id={`hass-${device.ieee_address}`}
                            defaultChecked={isHASSRename}
                            onChange={(e) => setIsHASSRename(e.target.checked)}
                        />
                        {t("update_Home_assistant_entity_id")}
                    </label>
                )}
            </div>
        </Modal>
    );
});
