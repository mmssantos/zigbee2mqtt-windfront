import {
    faArrowsSpin,
    faBug,
    faCog,
    faCogs,
    faDownLong,
    faInfo,
    faLink,
    faReceipt,
    faWandMagic,
    faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router";
import { ContentRenderer } from "../components/device-page/ContentRenderer.js";
import { HeaderDeviceSelector } from "../components/device-page/HeaderDeviceSelector.js";
import type { DevicePageUrlParams } from "../components/device-page/index.js";
import { useAppSelector } from "../hooks/useApp.js";

export default function DevicePage(): JSX.Element {
    const { t } = useTranslation("devicePage");
    const devices = useAppSelector((state) => state.devices);
    const params = useParams<DevicePageUrlParams>();
    const device = params.dev ? devices[params.dev] : undefined;

    const isActive = ({ isActive }) => (isActive ? " menu-active" : "");

    if (!device) {
        return <div className="flex-auto justify-center items-center">{t("unknown_device")}</div>;
    }

    return (
        <>
            <HeaderDeviceSelector allDevices={devices} currentDevice={device} tab={params.tab} />
            <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
                <li>
                    <NavLink to={`/device/${params.dev!}/info`} className={isActive}>
                        <FontAwesomeIcon icon={faInfo} />
                        {t("about")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/exposes`} className={isActive}>
                        <FontAwesomeIcon icon={faWandMagic} />
                        {t("exposes")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/bind`} className={isActive}>
                        <FontAwesomeIcon icon={faLink} />
                        {t("bind")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/reporting`} className={isActive}>
                        <FontAwesomeIcon icon={faDownLong} />
                        {t("reporting")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/settings`} className={isActive}>
                        <FontAwesomeIcon icon={faCogs} />
                        {t("settings")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/settings-specific`} className={isActive}>
                        <FontAwesomeIcon icon={faCog} />
                        {t("settings_specific")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/state`} className={isActive}>
                        <FontAwesomeIcon icon={faArrowsSpin} />
                        {t("state")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/clusters`} className={isActive}>
                        <FontAwesomeIcon icon={faReceipt} />
                        {t("clusters")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/scene`} className={isActive}>
                        <FontAwesomeIcon icon={faWandSparkles} />
                        {t("scene")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${params.dev!}/dev-console`} className={isActive}>
                        <FontAwesomeIcon icon={faBug} />
                        {t("dev_console")}
                    </NavLink>
                </li>
            </ul>
            <div className="block bg-base-100 border-base-300 p-6">
                <ContentRenderer />
            </div>
        </>
    );
}
