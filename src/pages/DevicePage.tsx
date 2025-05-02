import {
    faArrowsSpin,
    faBug,
    faCog,
    faCogs,
    faDownLong,
    faInfo,
    faLink,
    faObjectGroup,
    faReceipt,
    faWandMagic,
    faWandSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, lazy, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";
import { HeaderDeviceSelector } from "../components/device-page/HeaderDeviceSelector.js";
import { useAppSelector } from "../hooks/useApp.js";

export type TabName =
    | "info"
    | "bind"
    | "state"
    | "exposes"
    | "clusters"
    | "reporting"
    | "settings"
    | "settings-specific"
    | "dev-console"
    | "groups"
    | "scene";

type DevicePageUrlParams = {
    deviceId: string;
    tab?: TabName;
};

const BindTab = lazy(async () => await import("../components/device-page/tabs/Bind.js"));
const ClustersTab = lazy(async () => await import("../components/device-page/tabs/Clusters.js"));
const DevConsoleTab = lazy(async () => await import("../components/device-page/tabs/DevConsole.js"));
const DeviceInfoTab = lazy(async () => await import("../components/device-page/tabs/DeviceInfo.js"));
const DeviceSettingsTab = lazy(async () => await import("../components/device-page/tabs/DeviceSettings.js"));
const DeviceSpecificSettingsTab = lazy(async () => await import("../components/device-page/tabs/DeviceSpecificSettings.js"));
const ExposesTab = lazy(async () => await import("../components/device-page/tabs/Exposes.js"));
const GroupsTab = lazy(async () => await import("../components/device-page/tabs/Groups.js"));
const ReportingTab = lazy(async () => await import("../components/device-page/tabs/Reporting.js"));
const SceneTab = lazy(async () => await import("../components/device-page/tabs/Scene.js"));
const StateTab = lazy(async () => await import("../components/device-page/tabs/State.js"));

export default function DevicePage(): JSX.Element {
    const { t } = useTranslation("devicePage");
    const devices = useAppSelector((state) => state.devices);
    const { deviceId, tab } = useParams<DevicePageUrlParams>();
    const navigate = useNavigate();
    const device = deviceId ? devices.find((device) => device.ieee_address === deviceId) : undefined;

    useEffect(() => {
        if (!tab && device) {
            navigate(`/device/${device.ieee_address}/info`);
        }
    }, [tab, device, navigate]);

    const isActive = ({ isActive }: NavLinkRenderProps) => (isActive ? " menu-active" : "");

    const content = useMemo(() => {
        if (!device) {
            return <div className="flex-auto justify-center items-center">{t("unknown_device")}</div>;
        }

        switch (tab) {
            case "info":
                return <DeviceInfoTab device={device} />;
            case "exposes":
                return <ExposesTab device={device} />;
            case "bind":
                return <BindTab device={device} />;
            case "reporting":
                return <ReportingTab device={device} />;
            case "settings":
                return <DeviceSettingsTab device={device} />;
            case "settings-specific":
                return <DeviceSpecificSettingsTab device={device} />;
            case "state":
                return <StateTab device={device} />;
            case "clusters":
                return <ClustersTab device={device} />;
            case "groups":
                return <GroupsTab device={device} />;
            case "scene":
                return <SceneTab device={device} />;
            case "dev-console":
                return <DevConsoleTab device={device} />;
        }
    }, [device, tab, t]);

    return (
        <>
            <HeaderDeviceSelector devices={devices} currentDevice={device} tab={tab} />
            <ul className="menu bg-base-200 menu-horizontal rounded-box">
                <li>
                    <NavLink to={`/device/${deviceId!}/info`} className={isActive}>
                        <FontAwesomeIcon icon={faInfo} />
                        {t("about")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/exposes`} className={isActive}>
                        <FontAwesomeIcon icon={faWandMagic} />
                        {t("exposes")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/bind`} className={isActive}>
                        <FontAwesomeIcon icon={faLink} />
                        {t("bind")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/reporting`} className={isActive}>
                        <FontAwesomeIcon icon={faDownLong} />
                        {t("reporting")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/settings`} className={isActive}>
                        <FontAwesomeIcon icon={faCogs} />
                        {t("settings")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/settings-specific`} className={isActive}>
                        <FontAwesomeIcon icon={faCog} />
                        {t("settings_specific")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/state`} className={isActive}>
                        <FontAwesomeIcon icon={faArrowsSpin} />
                        {t("state")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/clusters`} className={isActive}>
                        <FontAwesomeIcon icon={faReceipt} />
                        {t("clusters")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/groups`} className={isActive}>
                        <FontAwesomeIcon icon={faObjectGroup} />
                        {t("groups")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/scene`} className={isActive}>
                        <FontAwesomeIcon icon={faWandSparkles} />
                        {t("scene")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/device/${deviceId!}/dev-console`} className={isActive}>
                        <FontAwesomeIcon icon={faBug} />
                        {t("dev_console")}
                    </NavLink>
                </li>
            </ul>
            <div className="block p-6">{content}</div>
        </>
    );
}
