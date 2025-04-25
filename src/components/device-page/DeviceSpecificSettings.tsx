import { useCallback, useContext } from "react";
import type { CompositeFeature, Device, Endpoint } from "../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import { Composite } from "../features/Composite.js";
import FeatureWrapper from "../features/FeatureWrapper.js";

type DeviceSpecificSettingsProps = {
    device: Device;
};

export function DeviceSpecificSettings(props: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (_endpoint: Endpoint, value: Record<string, unknown>) => {
            await DeviceApi.setDeviceOptions(sendMessage, props.device.ieee_address, value as Record<string, unknown>);
        },
        [sendMessage, props.device.ieee_address],
    );

    if (props.device.definition?.options?.length) {
        const deviceState = bridgeInfo.config.devices[props.device.ieee_address] ?? {};

        return (
            <Composite
                showEndpointLabels={true}
                feature={{ features: props.device.definition.options } as CompositeFeature}
                type="composite"
                device={props.device}
                deviceState={deviceState}
                onChange={setDeviceOptions}
                featureWrapperClass={FeatureWrapper}
            />
        );
    }

    return t("empty_exposes_definition");
}
