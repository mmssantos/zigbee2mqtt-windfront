import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../button/Button.js";
import Modal from "../Modal.js";

type DialogConfirmationModalProps = {
    onConfirmHandler(): void;
};

export const DialogConfirmationModal = NiceModal.create((props: DialogConfirmationModalProps): JSX.Element => {
    const { onConfirmHandler } = props;
    const { t } = useTranslation("common");
    const modal = useModal();
    const renderFooter = () => (
        <>
            <Button className="btn btn-secondary" onClick={modal.remove}>
                {t("common:close")}
            </Button>
            <Button
                className="btn btn-primary ms-1"
                onClick={() => {
                    modal.remove();
                    onConfirmHandler();
                }}
            >
                {t("common:ok")}
            </Button>
        </>
    );

    return (
        <Modal isOpen={modal.visible} title={t("confirmation")} footer={renderFooter()}>
            <div className="flex flex-row justify-center items-center gap-2">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-error" />
                {t("dialog_confirmation_prompt")}
            </div>
        </Modal>
    );
});
