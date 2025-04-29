import { useCallback, useContext } from "react";
import type { CompositeFeature, Device } from "../../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { Composite } from "../../features/Composite.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";

type DeviceSpecificSettingsProps = {
    device: Device;
};

export function DeviceSpecificSettings(props: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage("bridge/request/device/options", { id: props.device.ieee_address, options });
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
