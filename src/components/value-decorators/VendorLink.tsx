import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Device } from "../../types.js";

export type VendorProps = {
    device: Device;
    anchor?: string;
};

export default function VendorLink(props: VendorProps) {
    const { t } = useTranslation("zigbee");
    const { device } = props;

    if (device.supported && device.definition) {
        const url = `https://www.zigbee2mqtt.io/supported-devices/#v=${encodeURIComponent(device.definition.vendor)}`;

        return (
            <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
                {device.definition.vendor}
            </Link>
        );
    }

    return <>{t("unsupported")}</>;
}
