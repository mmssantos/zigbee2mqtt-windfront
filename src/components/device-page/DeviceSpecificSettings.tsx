import { useContext } from "react";
import type { WithBridgeInfo } from "../../store.js";
import type { CompositeFeature, Device } from "../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { Composite } from "../features/composite/Composite.js";
import FeatureWrapper from "../features/composite/FeatureWrapper.js";

type DeviceSpecificSettingsProps = {
    device: Device;
} & WithBridgeInfo;

export function DeviceSpecificSettings(props: DeviceSpecificSettingsProps) {
    const {
        device,
        bridgeInfo: { config },
    } = props;

    if (device.definition?.options?.length) {
        const { sendMessage } = useContext(WebSocketApiRouterContext);
        const deviceState = config.devices[device.ieee_address] ?? {};

        return (
            <Composite
                showEndpointLabels={true}
                feature={{ features: device.definition.options } as CompositeFeature}
                type="composite"
                device={device}
                deviceState={deviceState}
                onChange={async (_endpoint, value) => {
                    await DeviceApi.setDeviceOptions(sendMessage, device.ieee_address, value as Record<string, unknown>);
                }}
                featureWrapperClass={FeatureWrapper}
            />
        );
    }
    const { t } = useTranslation(["exposes"]);

    return t("empty_exposes_definition");
}
