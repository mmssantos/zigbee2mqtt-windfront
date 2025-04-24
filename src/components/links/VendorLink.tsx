import { useTranslation } from "react-i18next";
import type { VendorProps } from "./index.js";

export default function VendorLink(props: VendorProps) {
    const { t } = useTranslation("zigbee");
    const { device } = props;
    if (device.supported && device.definition) {
        const url = `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(device.definition.vendor)}`;
        return (
            <a target="_blank" rel="noopener noreferrer" href={url} className="link link-hover">
                {device.definition.vendor}
            </a>
        );
    }
    return <>{t("unsupported")}</>;
}
