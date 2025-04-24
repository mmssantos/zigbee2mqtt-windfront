import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { type ChangeEvent, type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device } from "../../../types.js";

import Button from "../../button/Button.js";
import Modal from "../Modal.js";

type DeviceRemovalButtonProps = {
    device: Device;
    removeDevice(dev: string, force: boolean, block: boolean): Promise<void>;
};

export const RemoveDeviceModal = NiceModal.create((props: DeviceRemovalButtonProps): JSX.Element => {
    const modal = useModal();
    const { t } = useTranslation(["zigbee", "common"]);
    const { device, removeDevice } = props;
    const [removeParams, setRemoveParams] = useState({ block: false, force: false });

    const onDeviceRemovalParamChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { checked, name } = e.target;
        setRemoveParams({ ...removeParams, ...{ [name]: checked } });
    };
    const onRemoveClick = async () => {
        modal.remove();
        await removeDevice(device.friendly_name, removeParams.force, removeParams.block);
    };
    const renderFooter = () => (
        <>
            <Button className="btn btn-secondary" onClick={modal.remove}>
                {t("common:close")}
            </Button>
            <Button className="btn btn-error ms-1" onClick={onRemoveClick}>
                {t("common:delete")}
            </Button>
        </>
    );

    return (
        <Modal isOpen={modal.visible} title={`${t("remove_device")} ${device.friendly_name}`} footer={renderFooter()}>
            <div className="flex flex-col gap-2">
                <label className="label" key="force">
                    <input
                        type="checkbox"
                        className="toggle toggle-error"
                        id={`force-${device.ieee_address}`}
                        name="force"
                        defaultChecked={removeParams.force}
                        onChange={onDeviceRemovalParamChange}
                    />
                    {t("force_remove")}
                </label>
                <label className="label" key="block">
                    <input
                        type="checkbox"
                        className="toggle toggle-secondary"
                        id={`block-${device.ieee_address}`}
                        name="block"
                        defaultChecked={removeParams.block}
                        onChange={onDeviceRemovalParamChange}
                    />
                    {t("block_join")}
                </label>
            </div>
        </Modal>
    );
});
