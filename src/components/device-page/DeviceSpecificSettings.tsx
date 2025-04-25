import { useContext } from "react";
import type { WithBridgeInfo } from "../../store.js";
import type { CompositeFeature, Device } from "../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { Composite } from "../features/Composite.js";
import FeatureWrapper from "../features/FeatureWrapper.js";

type DeviceSpecificSettingsProps = {
    device: Device;
} & WithBridgeInfo;

export function DeviceSpecificSettings(props: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);

    if (props.device.definition?.options?.length) {
        const { sendMessage } = useContext(WebSocketApiRouterContext);
        const deviceState = props.bridgeInfo.config.devices[props.device.ieee_address] ?? {};

        return (
            <Composite
                showEndpointLabels={true}
                feature={{ features: props.device.definition.options } as CompositeFeature}
                type="composite"
                device={props.device}
                deviceState={deviceState}
                onChange={async (_endpoint, value) => {
                    await DeviceApi.setDeviceOptions(sendMessage, props.device.ieee_address, value as Record<string, unknown>);
                }}
                featureWrapperClass={FeatureWrapper}
            />
        );
    }

    return t("empty_exposes_definition");
}
