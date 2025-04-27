import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import type { useApiWebSocket } from "../../hooks/useApiWebSocket.js";
import type { Device, DeviceState } from "../../types.js";
import Button from "../button/Button.js";

type OtaControlGroup = {
    device: Device;
    state: DeviceState;
    sendMessage: ReturnType<typeof useApiWebSocket>["sendMessage"];
};

export default function OtaControlGroup(props: OtaControlGroup) {
    const { t } = useTranslation("ota");
    const { device, state, sendMessage } = props;
    const otaState = state?.update;

    if (otaState == null || otaState.state === "idle") {
        return (
            <div className="join">
                <Button<string>
                    className="btn btn-primary btn-sm join-item"
                    onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/check", { id: ieee })}
                    item={device.ieee_address}
                >
                    {t("check")}
                </Button>
                <Button<string>
                    className="btn btn-info btn-sm join-item"
                    onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/schedule", { id: ieee })}
                    item={device.ieee_address}
                    title={t("schedule")}
                    prompt
                >
                    <FontAwesomeIcon icon={faClock} />
                </Button>
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
        <div className="join">
            {otaState.state === "available" ? (
                <>
                    <Button<string>
                        className="btn btn-error btn-sm join-item"
                        onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/update", { id: ieee })}
                        item={device.ieee_address}
                        prompt
                    >
                        {t("update")}
                    </Button>
                    <Button<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/schedule", { id: ieee })}
                        item={device.ieee_address}
                        title={t("schedule")}
                        prompt
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Button>
                </>
            ) : otaState.state === "scheduled" ? (
                <Button<string>
                    className="btn btn-sm btn-error join-item"
                    onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/unschedule", { id: ieee })}
                    item={device.ieee_address}
                    prompt
                >
                    {t("unschedule")}
                </Button>
            ) : (
                <>
                    <Button<string>
                        className="btn btn-primary btn-sm join-item"
                        onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/check", { id: ieee })}
                        item={device.ieee_address}
                    >
                        {t("check")}
                    </Button>
                    <Button<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={async (ieee) => await sendMessage("bridge/request/device/ota_update/schedule", { id: ieee })}
                        item={device.ieee_address}
                        title={t("schedule")}
                        prompt
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Button>
                </>
            )}
        </div>
    );
}
