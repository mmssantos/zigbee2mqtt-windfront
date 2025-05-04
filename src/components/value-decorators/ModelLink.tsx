import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { SUPPORT_NEW_DEVICES_DOCS_URL } from "../../consts.js";
import type { VendorProps } from "./VendorLink.js";

const normalizeModel = (model: string): string => {
    const find = "[/| |:]";
    const re = new RegExp(find, "g");
    return model.replace(re, "_");
};

export default function ModelLink(props: VendorProps) {
    const { device, anchor } = props;
    const { t } = useTranslation("zigbee");
    let title = device.model_id || t("unknown");
    let url = SUPPORT_NEW_DEVICES_DOCS_URL;

    if (device.supported && device.definition) {
        const detailsAnchor = [
            encodeURIComponent(device.definition?.vendor?.toLowerCase()),
            encodeURIComponent(device.definition?.model?.toLowerCase()),
        ].join("-");
        url = `https://www.zigbee2mqtt.io/devices/${encodeURIComponent(
            normalizeModel(device.definition?.model),
        )}.html#${encodeURIComponent(normalizeModel(anchor || detailsAnchor))}`;
        title = device.definition.model;
    }

    return (
        <Link target="_blank" rel="noopener noreferrer" to={url} className="link link-hover">
            {title}
        </Link>
    );
}
