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

export default function DeviceSpecificSettings(props: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage("bridge/request/device/options", { id: props.device.ieee_address, options });
        },
        [sendMessage, props.device.ieee_address],
    );

    return props.device.definition?.options?.length ? (
        <div className="list bg-base-100 rounded-box shadow-md">
            <Composite
                showEndpointLabels={true}
                feature={{ features: props.device.definition.options, type: "composite" } as CompositeFeature}
                device={props.device}
                deviceState={(bridgeInfo.config.devices[props.device.ieee_address] ?? {}) as unknown as Record<string, unknown>}
                onChange={setDeviceOptions}
                featureWrapperClass={FeatureWrapper}
            />
        </div>
    ) : (
        t("empty_exposes_definition")
    );
}
