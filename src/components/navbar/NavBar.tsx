import { useCallback, useContext, useMemo } from "react";

import { faBars, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router";
import { ReadyState } from "react-use-websocket";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/useApp.js";
import LocalePicker from "../../i18n/LocalePicker.js";
import { isIframe } from "../../utils.js";
import { ThemeSwitcher } from "../ThemeSwitcher.js";
import Button from "../button/Button.js";
import PermitJoinButton from "./PermitJoinButton.js";

const URLS = [
    {
        href: "/",
        key: "devices",
        exact: true,
    },
    {
        href: "/dashboard",
        key: "dashboard",
    },
    {
        href: "/network",
        key: "network",
    },
    {
        href: "/groups",
        key: "groups",
    },
    {
        href: "/ota",
        key: "ota",
    },
    {
        href: "/touchlink",
        key: "touchlink",
    },
    {
        href: "/logs",
        key: "logs",
    },
];

const CONNECTION_STATUS = {
    [ReadyState.CONNECTING]: "status-info",
    [ReadyState.OPEN]: "status-success",
    [ReadyState.CLOSING]: "status-warning",
    [ReadyState.CLOSED]: "status-error",
    [ReadyState.UNINSTANTIATED]: "status-error",
};

export const NavBar = () => {
    const { t } = useTranslation("navbar");
    const restartRequired = useAppSelector((state) => state.bridgeInfo.restart_required);
    const { sendMessage, readyState } = useContext(WebSocketApiRouterContext);
    const connectionStatus = CONNECTION_STATUS[readyState];

    const renderLinks = useCallback(
        (id: "lg" | "sm") => (
            <>
                {URLS.map((url) => (
                    <li key={url.href}>
                        <NavLink to={url.href} className={({ isActive }) => (isActive ? "menu-active" : "")}>
                            {t(url.key)}
                        </NavLink>
                    </li>
                ))}
                <li key="settings">
                    <NavLink className={({ isActive }) => `${isActive ? " menu-active" : ""}`} to="/settings/about">
                        &nbsp;
                        <FontAwesomeIcon icon={faCog} title={t("settings")} />
                        &nbsp;
                    </NavLink>
                </li>
                <PermitJoinButton key="permit-join" popoverId={id} />
            </>
        ),
        [t],
    );
    const renderedLinksLg = useMemo(() => renderLinks("lg"), [renderLinks]);
    const renderedLinksSm = useMemo(() => renderLinks("sm"), [renderLinks]);
    const showRestart = useMemo(
        () =>
            restartRequired ? (
                <Button className="btn btn-error me-1 animate-pulse" onClick={async () => await sendMessage("bridge/request/restart", "")} prompt>
                    {t("restart")}
                </Button>
            ) : null,
        [restartRequired, sendMessage, t],
    );

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div className="btn btn-ghost lg:hidden">
                        <FontAwesomeIcon icon={faBars} />
                    </div>
                    <ul className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-max p-2 shadow">{renderedLinksSm}</ul>
                </div>
            </div>
            <Link to="/" className="link link-hover me-1" title={isIframe() ? `Zigbee2MQTT@${document.location.hostname}` : ""}>
                Zigbee2MQTT
            </Link>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">{renderedLinksLg}</ul>
            </div>
            <div className="navbar-end">
                <ul className="menu menu-horizontal px-1">
                    {showRestart}
                    <LocalePicker />
                    <ThemeSwitcher />
                </ul>
                <div className="inline-grid *:[grid-area:1/1]">
                    <div className={`status ${connectionStatus} animate-ping`} />
                    <div className={`status ${connectionStatus}`} />
                </div>
            </div>
        </div>
    );
};
