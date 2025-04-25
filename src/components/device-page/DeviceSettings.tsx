import Form, { type ISubmitEvent, type UiSchema } from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import merge from "lodash/merge.js";
import { useCallback, useContext, useState } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import { DescriptionField, TitleField } from "../../i18n/rjsf-translation-fields.js";
import type { Device } from "../../types.js";
import { computeSettingsDiff } from "../../utils.js";
import { ReadTheDocsInfo } from "../ReadTheDocsInfo.js";

type Kvp = Record<string, unknown>;

interface DeviceSettingsProps {
    device: Device;
}

const genericUiSchema: UiSchema = {
    "ui:order": ["friendly_name", "disabled", "retain", "retention", "qos", "filtered_attributes", "*"],
};

export function DeviceSettings(props: DeviceSettingsProps) {
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const [state, setState] = useState<Record<string, unknown>>({});
    let formData: Kvp | Kvp[] | undefined = undefined;
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const getGenericDeviceSettingsSchema = useCallback(
        (): RJSFSchema => (bridgeInfo.config_schema.definitions?.device ?? { properties: {} }) as RJSFSchema,
        [bridgeInfo.config_schema.definitions],
    );

    const getDeviceConfig = useCallback(
        (): Kvp | Kvp[] => merge({}, bridgeInfo.config?.device_options, bridgeInfo.config?.devices[props.device.ieee_address], state),
        [bridgeInfo.config, state, props.device.ieee_address],
    );

    const getSchemaAndConfig = useCallback((): { schema: RJSFSchema; data: Kvp | Kvp[]; uiSchema: UiSchema } => {
        const genericDeviceSettingsSchema = getGenericDeviceSettingsSchema();
        const deviceConfig = getDeviceConfig();

        return { schema: genericDeviceSettingsSchema, data: deviceConfig, uiSchema: genericUiSchema };
    }, [getDeviceConfig, getGenericDeviceSettingsSchema]);

    const updateConfig = useCallback(
        async (params: ISubmitEvent<Kvp | Kvp[]>): Promise<void> => {
            const { data } = getSchemaAndConfig();
            const diff = computeSettingsDiff(data, params.formData);

            await DeviceApi.setDeviceOptions(sendMessage, props.device.ieee_address, diff as Record<string, unknown>);

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
