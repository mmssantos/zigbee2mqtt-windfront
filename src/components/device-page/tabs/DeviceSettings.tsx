import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Form from "@rjsf/core";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import Validator from "@rjsf/validator-ajv8";
import merge from "lodash/merge.js";
import { useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { DEVICE_OPTIONS_DOCS_URL } from "../../../consts.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { DescriptionField, TitleField } from "../../../i18n/rjsf-translation-fields.js";
import type { Device } from "../../../types.js";
import { computeSettingsDiff } from "../../../utils.js";

type Kvp = Record<string, unknown>;

interface DeviceSettingsProps {
    device: Device;
}

// XXX: workaround typing
const FormTyped = Form as unknown as typeof Form.default;
const ValidatorTyped = Validator as unknown as typeof Validator.default;

const GENERIC_UI_SCHEMA: UiSchema = {
    "ui:order": ["friendly_name", "disabled", "retain", "retention", "qos", "filtered_attributes", "*"],
};

export default function DeviceSettings(props: DeviceSettingsProps) {
    const { t } = useTranslation("common");
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const [state, setState] = useState<Record<string, unknown>>({});
    let formData: Kvp | Kvp[] | undefined = undefined;
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const getGenericDeviceSettingsSchema = useCallback(
        (): RJSFSchema => (bridgeInfo.config_schema.definitions.device ?? { properties: {} }) as RJSFSchema,
        [bridgeInfo.config_schema.definitions],
    );

    const getDeviceConfig = useCallback(
        (): Kvp | Kvp[] => merge({}, bridgeInfo.config.device_options, bridgeInfo.config.devices[props.device.ieee_address], state),
        [bridgeInfo.config, state, props.device.ieee_address],
    );

    const getSchemaAndConfig = useCallback((): { schema: RJSFSchema; data: Kvp | Kvp[]; uiSchema: UiSchema } => {
        const genericDeviceSettingsSchema = getGenericDeviceSettingsSchema();
        const deviceConfig = getDeviceConfig();

        return { schema: genericDeviceSettingsSchema, data: deviceConfig, uiSchema: GENERIC_UI_SCHEMA };
    }, [getDeviceConfig, getGenericDeviceSettingsSchema]);

    const updateConfig = useCallback(
        async (params: ISubmitEvent<Kvp | Kvp[]>): Promise<void> => {
            const { data } = getSchemaAndConfig();
            const diff = computeSettingsDiff(data, params.formData);

            await sendMessage("bridge/request/device/options", { id: props.device.ieee_address, options: diff });

            setState({});
        },
        [sendMessage, props.device.ieee_address, getSchemaAndConfig],
    );

    const { schema, data, uiSchema } = getSchemaAndConfig();

    // Put formData in separate variable to prevent overwrites on re-render.
    if (!formData) {
        formData = data;
    }

    return (
        <>
            <div className="alert alert-info mb-3" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={DEVICE_OPTIONS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("read_the_docs_info")}
                </a>
            </div>
            <FormTyped
                validator={ValidatorTyped}
                schema={schema}
                formData={formData}
                onChange={(data) => {
                    formData = data.formData;
                }}
                onSubmit={updateConfig}
                uiSchema={uiSchema}
                fields={{ TitleField, DescriptionField }}
            />
        </>
    );
}
