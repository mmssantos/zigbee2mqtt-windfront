import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import Button from "../../button/Button.js";
import Modal from "../Modal.js";

export const MapHelpModal = NiceModal.create(() => {
    const modal = useModal();
    const { t } = useTranslation("map");

    return (
        <Modal
            isOpen={modal.visible}
            title={t("network_map")}
            footer={
                <Button className="btn btn-secondary" onClick={modal.remove}>
                    {t("common:close")}
                </Button>
            }
        >
            <div>
                <div>{t("help_lqi_description")}</div>
            </div>
        </Modal>
    );
});
