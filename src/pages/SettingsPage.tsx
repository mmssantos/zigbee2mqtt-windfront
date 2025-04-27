import { faCode, faCogs, faInfo, faThumbsUp, faToolbox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Form from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import Validator from "@rjsf/validator-ajv8";
import { saveAs } from "file-saver";
import cloneDeep from "lodash/cloneDeep.js";
import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Navigate, useParams } from "react-router";
import frontendPackageJson from "../../package.json" with { type: "json" };
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import { ImageLocaliser } from "../components/settings-page/ImageLocaliser.js";
import { Stats } from "../components/settings-page/Stats.js";
import uiSchemas from "../components/settings-page/uiSchema.json" with { type: "json" };
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { DescriptionField, TitleField } from "../i18n/rjsf-translation-fields.js";
import store, { setBackupPreparing } from "../store.js";
import { computeSettingsDiff, download, formatDate } from "../utils.js";

// XXX: workaround typing
const FormTyped = Form as unknown as typeof Form.default;
const ValidatorTyped = Validator as unknown as typeof Validator.default;

type SettingsTab = "settings" | "bridge" | "about" | "tools" | "donate" | "translate";

type SettingsKeys = string;
type UrlParams = {
    tab?: SettingsTab;
};

type SettingsPageState = {
    keyName: SettingsKeys;
};

const ROOT_KEY_NAME = "main";

const IGNORED_FIELDS = ["groups", "devices", "device_options", "ban", "whitelist", "map_options"];
const VALID_JSON_SCHEMAS_AS_TABS = ["object", "array"];

const removePropertiesFromSchema = (names: string[], schema: RJSFSchema = {}, config: Record<string, unknown> = {}) => {
    if (schema.required) {
        schema.required = schema.required.filter((item) => names.includes(item));
    }

    for (const name of names) {
        if (schema.properties) {
            delete schema.properties[name];
        }
        delete config[name];
    }

    return { schema, config };
};

const DONATE_ROWS = [
    <div key="Nerivec" className="row pb-2">
        <div className="col">
            <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/Nerivec" className="link link-hover">
                <img
                    alt="Nerivec"
                    crossOrigin="anonymous"
                    src="https://img.buymeacoffee.com/button-api/?text=Thanks Nerivec&emoji=☕&slug=Nerivec&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                />
            </a>
        </div>
    </div>,
    <div key="nurikk" className="row pb-2">
        <div className="col">
            <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/nurikk" className="link link-hover">
                <img
                    alt="nurikk"
                    crossOrigin="anonymous"
                    src="https://img.buymeacoffee.com/button-api/?text=Thanks Nurikk&emoji=🍺&slug=nurikk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                />
            </a>
        </div>
    </div>,
    <div key="koenkk" className="row pb-2">
        <div className="col">
            <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/koenkk" className="link link-hover">
                <img
                    alt="koenkk"
                    crossOrigin="anonymous"
                    src="https://img.buymeacoffee.com/button-api/?text=Thanks Koenkk&emoji=☕&slug=koenkk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                />
            </a>
        </div>
    </div>,
].sort(() => Math.random() - 0.5);

const isValidKeyToRenderAsTab = (key: string, value: RJSFSchema): boolean =>
    (VALID_JSON_SCHEMAS_AS_TABS.includes(value.type as string) && !IGNORED_FIELDS.includes(key)) || (value?.oneOf ? value.oneOf.length > 0 : false);

export default function SettingsPage() {
    const [state, setState] = useState<SettingsPageState>({ keyName: ROOT_KEY_NAME });
    const params = useParams<UrlParams>();
    const settingsFormData: { [s: string]: Record<string, unknown> } = {};
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const dispatch = useAppDispatch();
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const backup = useAppSelector((state) => state.backup);
    const preparingBackup = useAppSelector((state) => state.preparingBackup);
    const devices = useAppSelector((state) => state.devices);
    const { t } = useTranslation("settings");

    const downloadBackup = (): void => {
        const ts = formatDate(new Date()).replace(/[\s_:]/g, "-");
        const backupFileName = `z2m-backup.${bridgeInfo.version}.${ts}.zip`;
        saveAs(`data:application/zip;base64,${backup}`, backupFileName);
    };
    const addInstallCode = async () => {
        const code = prompt(t("enter_install_code"));
        if (code) {
            await sendMessage("bridge/request/install_code/add", { value: code });
        }
    };
    const getSettingsTabs = (): { name: string; title: string }[] => {
        const tabs = Object.entries<RJSFSchema>((bridgeInfo.config_schema.properties as unknown as ArrayLike<RJSFSchema>) || {})
            .filter(([key, value]) => isValidKeyToRenderAsTab(key, value))
            .map(([key, value]) => ({
                name: key,
                title: t(key, { defaultValue: value.title }),
            }));
        tabs.unshift({
            name: ROOT_KEY_NAME,
            title: t("main", { defaultValue: "Main" }),
        });
        return tabs;
    };
    const getSettingsInfo = (): { currentSchema: RJSFSchema; currentConfig: Record<string, unknown> } => {
        const { keyName } = state;

        let configAndSchema = removePropertiesFromSchema(
            IGNORED_FIELDS,
            cloneDeep(bridgeInfo.config_schema),
            cloneDeep<Record<string, unknown>>(bridgeInfo.config),
        );

        let currentSchema: RJSFSchema = configAndSchema.schema;
        let currentConfig: Record<string, unknown>;

        if (keyName === ROOT_KEY_NAME) {
            const ignoreTabNames = getSettingsTabs().map((tab) => tab.name);
            configAndSchema = removePropertiesFromSchema(ignoreTabNames, configAndSchema.schema, configAndSchema.config);
            currentSchema = configAndSchema.schema;
            currentConfig = configAndSchema.config;
        } else {
            currentConfig = configAndSchema.config[keyName] as Record<string, unknown>;
            if (configAndSchema.schema.properties) {
                currentSchema = configAndSchema.schema.properties[keyName] as RJSFSchema;
            }
        }
        return { currentSchema, currentConfig };
    };
    const isActive = ({ isActive }) => (isActive ? " menu-active" : "");

    const renderCategoriesTabs = (): JSX.Element => {
        return (
            <ul className="menu bg-base-200 lg:menu-horizontal rounded-box">
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
                        {t("raw")}
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/donate" className={isActive}>
                        <FontAwesomeIcon icon={faThumbsUp} />
                        {t("donate")}
                    </NavLink>
                </li>
            </ul>
        );
    };
    const renderSwitcher = (): JSX.Element => {
        switch (params.tab) {
            case "settings":
                return renderSettings();
            case "tools":
                return renderTools();
            case "about":
                return renderAbout();
            case "bridge":
                return renderBridgeInfo();
            case "donate":
                return renderDonate();
            default:
                return <Navigate to={"/settings/settings"} />;
        }
    };
    const renderSettingsTabs = (): JSX.Element => {
        const tabs = getSettingsTabs();
        const { keyName } = state;
        return (
            <div className="nav nav-pills">
                {tabs.map((tab) => (
                    <li key={tab.name} className="nav-item">
                        <Link
                            className={`nav-link${keyName === tab.name ? "bg-primary active" : ""}`}
                            aria-current="page"
                            to="#"
                            onClick={(e) => {
                                setState({ keyName: tab.name });
                                e.preventDefault();
                            }}
                        >
                            {t(tab.name, { defaultValue: tab.title })}
                        </Link>
                    </li>
                ))}
            </div>
        );
    };
    const renderSettings = (): JSX.Element => {
        const { keyName } = state;
        const { currentSchema, currentConfig } = getSettingsInfo();
        // Put formData in separate variable to prevent overwrites on re-render.
        if (!(keyName in settingsFormData)) {
            settingsFormData[keyName] = currentConfig;
        }
        return (
            <div className="tab">
                {renderSettingsTabs()}
                <div className="tab-content">
                    <div className="tab-pane active">
                        <FormTyped
                            validator={ValidatorTyped}
                            idPrefix={keyName}
                            schema={currentSchema}
                            formData={settingsFormData[keyName]}
                            onChange={(data) => {
                                settingsFormData[keyName] = data.formData;
                            }}
                            onSubmit={async (e) => {
                                const { formData } = e;
                                const { keyName } = state;
                                const diff = computeSettingsDiff(getSettingsInfo().currentConfig, formData);

                                if (keyName === ROOT_KEY_NAME) {
                                    await sendMessage("bridge/request/options", { options: diff });
                                } else {
                                    await sendMessage("bridge/request/options", { options: { [keyName]: diff } });
                                }
                            }}
                            uiSchema={uiSchemas[keyName]}
                            fields={{ TitleField, DescriptionField }}
                        />
                    </div>
                </div>
            </div>
        );
    };
    const renderTools = (): JSX.Element => {
        return (
            <div className="join join-vertical">
                <Button className="btn btn-error join-item mb-2" onClick={async () => await sendMessage("bridge/request/restart", "")} prompt>
                    {t("restart_zigbee2mqtt")}
                </Button>
                <Button
                    className="btn btn-primary join-item"
                    onClick={async () => await download(store.getState() as unknown as Record<string, unknown>, "state.json")}
                >
                    {t("download_state")}
                </Button>
                {preparingBackup ? (
                    <Button className="btn btn-primary join-item disabled">
                        <span className="loading loading-dots loading-xl" />
                    </Button>
                ) : backup ? (
                    <Button className="btn btn-primary join-item" onClick={downloadBackup}>
                        {t("download_z2m_backup")}
                    </Button>
                ) : (
                    <Button
                        className="btn btn-primary join-item"
                        onClick={async () => {
                            dispatch(setBackupPreparing());
                            await sendMessage("bridge/request/backup", "");
                        }}
                    >
                        {t("request_z2m_backup")}
                    </Button>
                )}
                <Button className="btn btn-primary join-item" onClick={addInstallCode}>
                    {t("add_install_code")}
                </Button>
                <ImageLocaliser devices={devices} />
            </div>
        );
    };
    const renderAbout = (): JSX.Element => {
        const isZigbee2mqttDevVersion = bridgeInfo.version.match(/^\d+\.\d+\.\d+$/) === null;
        const zigbee2mqttVersion = isZigbee2mqttDevVersion ? (
            <a
                className="link link-hover text-secondary"
                target="_blank"
                rel="noopener noreferrer"
                href={"https://github.com/Koenkk/zigbee2mqtt/commits/dev/"}
            >
                {bridgeInfo.version}
            </a>
        ) : (
            <a
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/Koenkk/zigbee2mqtt/releases/tag/${bridgeInfo.version}`}
            >
                {bridgeInfo.version}
            </a>
        );
        const zigbee2mqttCommit = bridgeInfo.commit ? (
            <>
                commit:{" "}
                <a
                    className="link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://github.com/Koenkk/zigbee2mqtt/commit/${bridgeInfo.commit}`}
                >
                    {bridgeInfo.commit}
                </a>
            </>
        ) : null;
        const frontendVersion = (
            <a
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/Nerivec/zigbee2mqtt-windfront/releases/tag/${frontendPackageJson.version}`}
            >
                {frontendPackageJson.version}
            </a>
        );
        const zhcVersion = (
            <a
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/Koenkk/zigbee-herdsman-converters/releases/tag/v${bridgeInfo.zigbee_herdsman_converters.version}`}
            >
                {bridgeInfo.zigbee_herdsman_converters.version}
            </a>
        );
        const zhVersion = (
            <a
                className="link link-hover"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://github.com/Koenkk/zigbee-herdsman/releases/tag/v${bridgeInfo.zigbee_herdsman.version}`}
            >
                {bridgeInfo.zigbee_herdsman.version}
            </a>
        );

        return (
            <div className="flex flex-col gap-3 items-center">
                <div className="stats shadow">
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("zigbee2mqtt_version")}</div>
                        <div className="stat-value">{zigbee2mqttVersion}</div>
                        <div className="stat-desc">{zigbee2mqttCommit}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("frontend_version")}</div>
                        <div className="stat-value">{frontendVersion}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("zigbee_herdsman_converters_version")}</div>
                        <div className="stat-value">{zhcVersion}</div>
                    </div>
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("zigbee_herdsman_version")}</div>
                        <div className="stat-value">{zhVersion}</div>
                    </div>
                </div>
                <div className="stats shadow">
                    <div className="stat place-items-center">
                        <div className="stat-title">{t("coordinator")}</div>
                        <div className="stat-value">{bridgeInfo.coordinator.type}</div>
                        <div className="stat-desc flex flex-col gap-2 items-center">
                            <span className="badge badge-primary" title={t("coordinator_ieee_address")}>
                                {bridgeInfo.coordinator.ieee_address}
                            </span>
                            <span>
                                {t("revision")}
                                {": "}
                                {bridgeInfo.coordinator.meta.revision || t("zigbee:unknown")}
                            </span>
                        </div>
                    </div>
                </div>
                <ul className="menu bg-base-200 rounded-box min-w-sm">
                    <li>
                        <details open>
                            <summary>{t("stats")}</summary>
                            <Stats devices={devices} />
                        </details>
                    </li>
                </ul>
            </div>
        );
    };
    const renderBridgeInfo = (): JSX.Element => {
        const jsonState = JSON.stringify(bridgeInfo, null, 4);
        const lines = Math.max(10, (jsonState.match(/\n/g) || "").length + 1);

        return <textarea className="textarea w-full" readOnly rows={lines} defaultValue={JSON.stringify(bridgeInfo, null, 4)} />;
    };
    const renderDonate = (): JSX.Element => {
        return (
            <div className="container-fluid">
                {t("donation_text")}
                {DONATE_ROWS}
            </div>
        );
    };

    return (
        <>
            {renderCategoriesTabs()}
            <div className="block bg-base-100 border-base-300 p-6">{renderSwitcher()}</div>
        </>
    );
}
