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
import { type JSX, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate, useParams } from "react-router";
import { Bind } from "../components/device-page/Bind.js";
import Clusters from "../components/device-page/Clusters.js";
import { DevConsole } from "../components/device-page/DevConsole.js";
import { DeviceInfo } from "../components/device-page/DeviceInfo.js";
import { DeviceSettings } from "../components/device-page/DeviceSettings.js";
import { DeviceSpecificSettings } from "../components/device-page/DeviceSpecificSettings.js";
import { Exposes } from "../components/device-page/Exposes.js";
import { HeaderDeviceSelector } from "../components/device-page/HeaderDeviceSelector.js";
import { Reporting } from "../components/device-page/Reporting.js";
import { ScenePage } from "../components/device-page/ScenePage.js";
import { States } from "../components/device-page/States.js";
import { useAppSelector } from "../hooks/useApp.js";

export type TabName = "info" | "bind" | "state" | "exposes" | "clusters" | "reporting" | "settings" | "settings-specific" | "dev-console" | "scene";

type DevicePageUrlParams = {
    dev: string;
    tab?: TabName;
};

export default function DevicePage(): JSX.Element {
    const { t } = useTranslation("devicePage");
    const devices = useAppSelector((state) => state.devices);
    const { dev, tab } = useParams<DevicePageUrlParams>();
    const navigate = useNavigate();
    const device = dev ? devices.find((device) => device.ieee_address === dev) : undefined;

    const isActive = ({ isActive }) => (isActive ? " menu-active" : "");

    useEffect(() => {
        if (!tab && device) {
            navigate(`/device/${device.ieee_address}/info`);
        }
    }, [tab, device, navigate]);

    const content = useMemo(() => {
        if (!device) {
            return <div className="flex-auto justify-center items-center">{t("unknown_device")}</div>;
        }

        switch (tab) {
            case "bind":
                return <Bind device={device} />;
            case "state":
                return <States device={device} />;
            case "exposes":
                return <Exposes device={device} />;
            case "clusters":
                return <Clusters device={device} />;
            case "reporting":
                return <Reporting device={device} />;
            case "settings":
                return <DeviceSettings device={device} />;
            case "settings-specific":
                return <DeviceSpecificSettings device={device} />;
            case "dev-console":
                return <DevConsole device={device} />;
            case "scene":
                return <ScenePage device={device} />;
            default:
                return <DeviceInfo device={device} />;
        }
    }, [device, tab, t]);

    return (
        <>
            <HeaderDeviceSelector devices={devices} currentDevice={device} tab={tab} />
            <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
                <li>
                    <NavLink to={`/device/${dev!}/info`} className={isActive}>
                        <FontAwesomeIcon icon={faInfo} />
                        {t("about")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/exposes`} className={isActive}>
                        <FontAwesomeIcon icon={faWandMagic} />
                        {t("exposes")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/bind`} className={isActive}>
                        <FontAwesomeIcon icon={faLink} />
                        {t("bind")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/reporting`} className={isActive}>
                        <FontAwesomeIcon icon={faDownLong} />
                        {t("reporting")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/settings`} className={isActive}>
                        <FontAwesomeIcon icon={faCogs} />
                        {t("settings")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/settings-specific`} className={isActive}>
                        <FontAwesomeIcon icon={faCog} />
                        {t("settings_specific")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/state`} className={isActive}>
                        <FontAwesomeIcon icon={faArrowsSpin} />
                        {t("state")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/clusters`} className={isActive}>
                        <FontAwesomeIcon icon={faReceipt} />
                        {t("clusters")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/scene`} className={isActive}>
                        <FontAwesomeIcon icon={faWandSparkles} />
                        {t("scene")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${dev!}/dev-console`} className={isActive}>
                        <FontAwesomeIcon icon={faBug} />
                        {t("dev_console")}
                    </NavLink>
                </li>
            </ul>
            <div className="block bg-base-100 border-base-300 p-6">{content}</div>
        </>
    );
}
