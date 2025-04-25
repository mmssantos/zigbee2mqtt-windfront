import { faBan, faExclamationTriangle, faQuestionCircle, faSpinner, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import genericDevice from "../../images/generic-zigbee-device.png";
import { type Device, type DeviceState, InterviewState } from "../../types.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { LazyImage } from "./LazyImage.js";

type DeviceImageProps = {
    device: Device;
    deviceState?: DeviceState;
    disabled: boolean;
    type?: "img" | "svg";
    className?: string;
    width?: number;
    height?: number;
    noIndicator?: boolean;
};

export function DeviceImage(props: Readonly<DeviceImageProps>) {
    const { t } = useTranslation("zigbee");
    const { device = {} as Device, disabled, deviceState, type = "img", className, noIndicator, ...rest } = props;

    if (type === "svg") {
        return (
            <Suspense fallback={<image crossOrigin={"anonymous"} {...rest} href={genericDevice} />}>
                <ErrorBoundary>
                    <LazyImage type="svg" device={device} {...rest} />
                </ErrorBoundary>
            </Suspense>
        );
    }

    const otaState = deviceState?.update;
    const interviewState =
        device.interview_state === InterviewState.InProgress ? (
            <FontAwesomeIcon icon={faSpinner} spin title={t("interviewing")} className="indicator-item indicator-bottom indicator-end text-info" />
        ) : device.interview_state === InterviewState.Failed ? (
            <FontAwesomeIcon
                icon={faExclamationTriangle}
                beat
                title={t("interview_failed")}
                className="indicator-item indicator-bottom indicator-end text-error"
            />
        ) : device.supported ? null : (
            <FontAwesomeIcon
                icon={faQuestionCircle}
                beat
                title={t("unsupported")}
                className="indicator-item indicator-bottom indicator-end text-warning"
            />
        );

    return (
        <Suspense fallback={<img alt="" src={genericDevice} />}>
            <ErrorBoundary>
                {noIndicator ? (
                    <LazyImage type="img" device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                ) : (
                    <div className="indicator w-full">
                        {otaState?.state === "updating" && (
                            <FontAwesomeIcon
                                icon={faSync}
                                spin
                                title={t("updating_firmware")}
                                className="indicator-item indicator-top indicator-end text-info"
                            />
                        )}
                        {interviewState}
                        {disabled && (
                            <FontAwesomeIcon
                                icon={faBan}
                                title={t("device_disabled")}
                                className="indicator-item indicator-middle indicator-center text-warning"
                            />
                        )}
                        <LazyImage type="img" device={device} className={`grid place-items-center${className ? ` ${className}` : ""}`} />
                    </div>
                )}
            </ErrorBoundary>
        </Suspense>
    );
}
