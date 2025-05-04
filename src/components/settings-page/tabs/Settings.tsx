import Form from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import Validator from "@rjsf/validator-ajv8";
import cloneDeep from "lodash/cloneDeep.js";
import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { DescriptionField, TitleField } from "../../../i18n/rjsf-translation-fields.js";
import { computeSettingsDiff } from "../../../utils.js";
import uiSchemas from "../uiSchema.json" with { type: "json" };

// XXX: workaround typing
const FormTyped = Form as unknown as typeof Form.default;
const ValidatorTyped = Validator as unknown as typeof Validator.default;

type SettingsKeys = string;
type SettingsPageState = {
    keyName: SettingsKeys;
};

const ROOT_KEY_NAME = "main";

const IGNORED_FIELDS = ["groups", "devices", "device_options", "map_options"];
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

const isValidKeyToRenderAsTab = (key: string, value: RJSFSchema): boolean =>
    (VALID_JSON_SCHEMAS_AS_TABS.includes(value.type as string) && !IGNORED_FIELDS.includes(key)) || (value?.oneOf ? value.oneOf.length > 0 : false);

export default function Settings() {
    const settingsFormData: { [s: string]: Record<string, unknown> } = {};
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const [state, setState] = useState<SettingsPageState>({ keyName: ROOT_KEY_NAME });
    const { keyName } = state;
    const { t } = useTranslation("settings");

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
            cloneDeep<Record<string, unknown>>(bridgeInfo.config as unknown as Record<string, unknown>),
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

    const renderSettingsTabs = (): JSX.Element => {
        const tabs = getSettingsTabs();
        const { keyName } = state;

        return (
            <div className="tabs tabs-lift">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        className={`tab${keyName === tab.name ? " tab-active" : ""}`}
                        aria-current="page"
                        to="#"
                        onClick={(e) => {
                            setState({ keyName: tab.name });
                            e.preventDefault();
                        }}
                    >
                        {t(tab.name, { defaultValue: tab.title })}
                    </Link>
                ))}
            </div>
        );
    };

    const { currentSchema, currentConfig } = getSettingsInfo();

    // Put formData in separate variable to prevent overwrites on re-render.
    if (!(keyName in settingsFormData)) {
        settingsFormData[keyName] = currentConfig;
    }

    return (
        <>
            {renderSettingsTabs()}
            <div className="block bg-base-100 border-base-300 p-6">
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
        </>
    );
}
