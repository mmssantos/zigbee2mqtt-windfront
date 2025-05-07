import saveAs from "file-saver";
import { useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppDispatch, useAppSelector } from "../../../hooks/useApp.js";
import store, { setBackupPreparing } from "../../../store.js";
import { download, formatDate } from "../../../utils.js";
import Button from "../../Button.js";
import { ImageLocaliser } from "../ImageLocaliser.js";

export default function Tools() {
    const dispatch = useAppDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const backup = useAppSelector((state) => state.backup);
    const preparingBackup = useAppSelector((state) => state.preparingBackup);
    const devices = useAppSelector((state) => state.devices);
    const { t } = useTranslation("settings");

    const downloadBackup = useCallback((): void => {
        const ts = formatDate(new Date()).replace(/[\s_:]/g, "-");
        const backupFileName = `z2m-backup.${bridgeInfo.version}.${ts}.zip`;

        saveAs(`data:application/zip;base64,${backup}`, backupFileName);
    }, [backup, bridgeInfo.version]);

    const addInstallCode = useCallback(async () => {
        const code = prompt(t("enter_install_code"));

        if (code) {
            await sendMessage("bridge/request/install_code/add", { value: code });
        }
    }, [sendMessage, t]);

    return (
        <div className="join join-vertical">
            <Button className="btn btn-error join-item mb-2" onClick={async () => await sendMessage("bridge/request/restart", "")} prompt>
                {t("restart_zigbee2mqtt")}
            </Button>
            <Button
                className="btn btn-primary join-item"
                onClick={async () => await download(store.getState() as unknown as Record<string, unknown>, "state.json")}
            >
                {t("download_state")}
            </Button>
            {preparingBackup ? (
                <Button className="btn btn-primary join-item disabled">
                    <span className="loading loading-dots loading-xl" />
                </Button>
            ) : backup ? (
                <Button className="btn btn-primary join-item" onClick={downloadBackup}>
                    {t("download_z2m_backup")}
                </Button>
            ) : (
                <Button
                    className="btn btn-primary join-item"
                    onClick={async () => {
                        dispatch(setBackupPreparing());
                        await sendMessage("bridge/request/backup", "");
                    }}
                >
                    {t("request_z2m_backup")}
                </Button>
            )}
            <Button className="btn btn-primary join-item" onClick={addInstallCode}>
                {t("add_install_code")}
            </Button>
            <ImageLocaliser devices={devices} />
        </div>
    );
}
