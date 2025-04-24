import { type JSX, useState } from "react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import Button from "../../button/Button.js";
import Modal from "../Modal.js";

type RenameGroupFormProps = {
    name: string;
    onRename(oldName: string, newName: string): Promise<void>;
};

export const RenameGroupForm = NiceModal.create((props: RenameGroupFormProps): JSX.Element => {
    const { name, onRename } = props;
    const modal = useModal();
    const { t } = useTranslation(["groups", "common"]);
    const [friendlyName, setFriendlyName] = useState(name);

    const onSaveClick = async (): Promise<void> => {
        modal.remove();
        await onRename(name, friendlyName);
    };
    const renderFooter = () => (
        <>
            <Button className="btn btn-secondary" onClick={modal.remove}>
                {t("common:close")}
            </Button>
            <Button className="btn btn-primary ms-1" onClick={onSaveClick}>
                {t("rename_group")}
            </Button>
        </>
    );

    return (
        <Modal isOpen={modal.visible} title={`${t("rename_group")} ${name}`} footer={renderFooter()}>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">{t("zigbee:friendly_name")}</legend>
                <input type="text" className="input" value={friendlyName} onChange={(e) => setFriendlyName(e.target.value)} />
            </fieldset>
        </Modal>
    );
});
