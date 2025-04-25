import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import * as OtaApi from "../../actions/OtaApi.js";
import type { ApiSendMessage } from "../../hooks/useApiWebSocket.js";
import type { Device, DeviceState } from "../../types.js";
import { toHHMMSS } from "../../utils.js";
import Button from "../button/Button.js";

type OtaControlGroup = {
    device: Device;
    state: DeviceState;
    sendMessage: ApiSendMessage;
};

export default function OtaControlGroup(props: OtaControlGroup) {
    const { t } = useTranslation("ota");
    const { device, state, sendMessage } = props;
    const otaState = state?.update;

    if (otaState != null) {
        switch (otaState.state) {
            case "updating":
                return (
                    <>
                        <progress className="progress w-48" value={otaState.progress} max="100" />
                        <div>{t("remaining_time", { remaining: toHHMMSS(otaState.remaining ?? 0) })}</div>
                    </>
                );
            case "available":
                return (
                    <div className="join">
                        <Button<string>
                            className="btn btn-error btn-sm join-item"
                            onClick={async (deviceName) => await OtaApi.updateOTA(sendMessage, deviceName)}
                            item={device.friendly_name}
                            prompt
                        >
                            {t("update")}
                        </Button>
                        <Button<string>
                            className="btn btn-info btn-sm join-item"
                            onClick={async (deviceName) => await OtaApi.scheduleOTA(sendMessage, deviceName)}
                            item={device.friendly_name}
                            title={t("schedule")}
                            prompt
                        >
                            <FontAwesomeIcon icon={faClock} />
                        </Button>
                    </div>
                );
            case "scheduled":
                return (
                    <div className="join">
                        <Button<string>
                            className="btn btn-primary btn-sm join-item"
                            onClick={async (deviceName) => await OtaApi.checkOTA(sendMessage, deviceName)}
                            item={device.friendly_name}
                        >
                            {t("check")}
                        </Button>
                        <Button<string>
                            className="btn btn-sm btn-error join-item"
                            onClick={async (deviceName) => await OtaApi.unscheduleOTA(sendMessage, deviceName)}
                            item={device.friendly_name}
                            title={t("scheduled")}
                            prompt
                        >
                            <FontAwesomeIcon icon={faClock} />
                        </Button>
                    </div>
                );
        }
    }

    return (
        <div className="join">
            <Button<string>
                className="btn btn-primary btn-sm join-item"
                onClick={async (deviceName) => await OtaApi.checkOTA(sendMessage, deviceName)}
                item={device.friendly_name}
            >
                {t("check")}
            </Button>
            <Button<string>
                className="btn btn-info btn-sm join-item"
                onClick={async (deviceName) => await OtaApi.scheduleOTA(sendMessage, deviceName)}
                item={device.friendly_name}
                title={t("schedule")}
                prompt
            >
                <FontAwesomeIcon icon={faClock} />
            </Button>
        </div>
    );
}
