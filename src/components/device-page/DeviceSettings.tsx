import Form, { type ISubmitEvent, type UiSchema } from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import merge from "lodash/merge.js";
import { useContext, useState } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { DescriptionField, TitleField } from "../../i18n/rjsf-translation-fields.js";
import { computeSettingsDiff } from "../../utils.js";
import { ReadTheDocsInfo } from "../ReadTheDocsInfo.js";
import type { DeviceSettingsProps, DeviceSettingsState, ParamValue } from "./index.js";

type Kvp = Record<string, unknown>;

const genericUiSchema: UiSchema = {
    "ui:order": ["friendly_name", "disabled", "retain", "retention", "qos", "filtered_attributes", "*"],
};

export function DeviceSettings(props: DeviceSettingsProps) {
    const [state, setState] = useState<DeviceSettingsState>({
        newSetting: {
            key: "",
            value: "",
            type: "",
        } as ParamValue,

        updatedDeviceConfig: {},
    });
    let formData: Kvp | Kvp[] | undefined = undefined;
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const getGenericDeviceSettingsSchema = (): RJSFSchema => {
        const {
            bridgeInfo: { config_schema: configSchema = {} },
        } = props;
        return (configSchema.definitions?.device ?? { properties: {} }) as RJSFSchema;
    };
    const getDeviceConfig = (): Kvp | Kvp[] => {
        const {
            bridgeInfo: { config },
            device,
        } = props;
        const { updatedDeviceConfig } = state;
        return merge({}, config?.device_options, config?.devices[device.ieee_address], updatedDeviceConfig);
    };
    const updateConfig = async (params: ISubmitEvent<Kvp | Kvp[]>): Promise<void> => {
        const { data } = getSchemaAndConfig();
        const { device } = props;
        const diff = computeSettingsDiff(data, params.formData);
        await DeviceApi.setDeviceOptions(sendMessage, device.ieee_address, diff as Record<string, unknown>);
        setState({ ...state, updatedDeviceConfig: {} });
    };
    const getSchemaAndConfig = (): { schema: RJSFSchema; data: Kvp | Kvp[]; uiSchema: UiSchema } => {
        const genericDeviceSettingsSchema = getGenericDeviceSettingsSchema();
        const deviceConfig = getDeviceConfig();
        return { schema: genericDeviceSettingsSchema, data: deviceConfig, uiSchema: genericUiSchema };
    };

    const { schema, data, uiSchema } = getSchemaAndConfig();
    // Put formData in separate variable to prevent overwrites on re-render.
    if (!formData) {
        formData = data;
    }

    return (
        <>
            <ReadTheDocsInfo docsUrl={"https://www.zigbee2mqtt.io/guide/configuration/devices-groups.html#common-device-options"} />

            <Form
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
