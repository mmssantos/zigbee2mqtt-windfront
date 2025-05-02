import { faCode, faCogs, faDisplay, faInfo, faThumbsUp, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, lazy, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, type NavLinkRenderProps, useNavigate, useParams } from "react-router";

type UrlParams = {
    tab?: "frontend" | "settings" | "bridge" | "about" | "tools" | "donate";
};

const AboutTab = lazy(async () => await import("../components/settings-page/tabs/About.js"));
const BridgeTab = lazy(async () => await import("../components/settings-page/tabs/Bridge.js"));
const DonateTab = lazy(async () => await import("../components/settings-page/tabs/Donate.js"));
const FrontendTab = lazy(async () => await import("../components/settings-page/tabs/Frontend.js"));
const SettingsTab = lazy(async () => await import("../components/settings-page/tabs/Settings.js"));
const ToolsTab = lazy(async () => await import("../components/settings-page/tabs/Tools.js"));

export default function SettingsPage() {
    const navigate = useNavigate();
    const { tab } = useParams<UrlParams>();
    const { t } = useTranslation(["settings", "navbar"]);

    useEffect(() => {
        if (!tab) {
            navigate("/settings/about");
        }
    }, [tab, navigate]);

    const content = useMemo((): JSX.Element => {
        switch (tab) {
            case "frontend":
                return <FrontendTab />;
            case "settings":
                return <SettingsTab />;
            case "tools":
                return <ToolsTab />;
            case "about":
                return <AboutTab />;
            case "bridge":
                return <BridgeTab />;
            case "donate":
                return <DonateTab />;
        }

        return <></>;
    }, [tab]);

    const isActive = ({ isActive }: NavLinkRenderProps) => (isActive ? " menu-active" : "");

    return (
        <>
            <ul className="menu bg-base-200 menu-horizontal rounded-box">
                <li>
                    <NavLink to="/settings/frontend" className={isActive}>
                        <FontAwesomeIcon icon={faDisplay} />
                        {t("frontend")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/settings" className={isActive}>
                        <FontAwesomeIcon icon={faCogs} />
                        {t("settings")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/tools" className={isActive}>
                        <FontAwesomeIcon icon={faToolbox} />
                        {t("tools")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/about" className={isActive}>
                        <FontAwesomeIcon icon={faInfo} />
                        {t("about")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/bridge" className={isActive}>
                        <FontAwesomeIcon icon={faCode} />
                        {t("bridge")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/donate" className={isActive}>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        {t("donate")}
                    </NavLink>
                </li>
            </ul>
            <div className="block bg-base-100 border-base-300 p-3">{content}</div>
        </>
    );
}
