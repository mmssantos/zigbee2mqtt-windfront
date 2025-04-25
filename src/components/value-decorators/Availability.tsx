import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import type { AvailabilityState } from "../../store.js";

export type AvailabilityStateProps = {
    availability: AvailabilityState;
    availabilityFeatureEnabled: boolean;
    availabilityEnabledForDevice: boolean | undefined;
    disabled: boolean;
};

export function Availability(props: AvailabilityStateProps): JSX.Element {
    const { t } = useTranslation(["availability"]);
    const { availability, availabilityFeatureEnabled, availabilityEnabledForDevice, disabled } = props;

    if (disabled) {
        return <span>{t("disabled")}</span>;
    }

    if (availabilityEnabledForDevice ?? availabilityFeatureEnabled) {
        return <span className={availability.state === "online" ? "text-success" : "text-error animate-ping"}>{t(availability.state)}</span>;
    }

    return (
        <a
            className="link link-hover"
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.zigbee2mqtt.io/guide/configuration/device-availability.html#availability-advanced-configuration"
        >
            {t("disabled")}
        </a>
    );
}
