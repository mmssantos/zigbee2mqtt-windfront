import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import type { Device, DeviceState } from "../../types.js";
import Button from "../Button.js";
import ConfirmButton from "../ConfirmButton.js";

type OtaControlGroup = {
    device: Device;
    state: DeviceState;
    onCheckClick: (ieee: string) => Promise<void>;
    onUpdateClick: (ieee: string) => Promise<void>;
    onScheduleClick: (ieee: string) => Promise<void>;
    onUnscheduleClick: (ieee: string) => Promise<void>;
};

export default function OtaControlGroup(props: OtaControlGroup) {
    const { t } = useTranslation(["ota", "common"]);
    const { device, state, onCheckClick, onUpdateClick, onScheduleClick, onUnscheduleClick } = props;
    const otaState = state?.update;

    if (otaState == null || otaState.state === "idle") {
        return (
            <div className="join join-vertical lg:join-horizontal">
                <Button<string> className="btn btn-primary btn-sm join-item" onClick={onCheckClick} item={device.ieee_address}>
                    {t("check")}
                </Button>
                <ConfirmButton<string>
                    className="btn btn-info btn-sm join-item"
                    onClick={onScheduleClick}
                    item={device.ieee_address}
                    title={t("schedule")}
                    modalDescription={t("schedule_info")}
                    modalCancelLabel={t("common:cancel")}
                >
                    <FontAwesomeIcon icon={faClock} />
                </ConfirmButton>
            </div>
        );
    }

    if (otaState.state === "updating") {
        if (otaState.remaining && otaState.remaining > 0) {
            const hours = Math.floor(otaState.remaining / 3600);
            const minutes = Math.floor(otaState.remaining / 60) % 60;
            const seconds = Math.floor(otaState.remaining % 60);
            const showHours = hours > 0;
            const showMinutes = minutes > 0;

            return (
                <>
                    <progress className="progress w-48" value={otaState.progress} max="100" />
                    <div>
                        {t("remaining_time")} {`${showHours ? `${hours}:` : ""}${showMinutes ? `${minutes}:` : ""}${seconds}`}
                    </div>
                </>
            );
        }

        return <progress className="progress w-48" value={otaState.progress} max="100" />;
    }

    return (
        <div className="join join-vertical lg:join-horizontal">
            {otaState.state === "available" ? (
                <>
                    <ConfirmButton<string>
                        className="btn btn-error btn-sm join-item"
                        onClick={onUpdateClick}
                        item={device.ieee_address}
                        title={t("update")}
                        modalDescription={t("common:dialog_confirmation_prompt")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        {t("update")}
                    </ConfirmButton>
                    <ConfirmButton<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={onScheduleClick}
                        item={device.ieee_address}
                        title={t("schedule")}
                        modalDescription={t("schedule_info")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </ConfirmButton>
                </>
            ) : otaState.state === "scheduled" ? (
                <ConfirmButton<string>
                    className="btn btn-sm btn-error join-item"
                    onClick={onUnscheduleClick}
                    item={device.ieee_address}
                    title={t("unschedule")}
                    modalDescription={t("common:dialog_confirmation_prompt")}
                    modalCancelLabel={t("common:cancel")}
                >
                    {t("unschedule")}
                </ConfirmButton>
            ) : (
                <>
                    <Button<string> className="btn btn-primary btn-sm join-item" onClick={onCheckClick} item={device.ieee_address}>
                        {t("check")}
                    </Button>
                    <ConfirmButton<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={onScheduleClick}
                        item={device.ieee_address}
                        title={t("schedule")}
                        modalDescription={t("schedule_info")}
                        modalCancelLabel={t("common:cancel")}
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </ConfirmButton>
                </>
            )}
        </div>
    );
}
