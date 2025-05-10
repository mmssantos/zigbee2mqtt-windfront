import { type JSX, useState } from "react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
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

    return (
        <Modal
            isOpen={modal.visible}
            title={`${t("rename_group")} ${name}`}
            footer={
                <>
                    <Button className="btn btn-secondary" onClick={modal.remove}>
                        {t("common:cancel")}
                    </Button>
                    <Button
                        className="btn btn-primary ms-1"
                        onClick={async (): Promise<void> => {
                            modal.remove();
                            await onRename(name, friendlyName);
                        }}
                    >
                        {t("rename_group")}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-2">
                <InputField
                    name="friendly_name"
                    label={t("common:friendly_name")}
                    onChange={(e) => setFriendlyName(e.target.value)}
                    defaultValue={friendlyName}
                    type="text"
                    required
                />
            </div>
        </Modal>
    );
});
