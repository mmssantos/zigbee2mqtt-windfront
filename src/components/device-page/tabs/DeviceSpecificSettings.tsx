import { useCallback, useContext } from "react";
import { type Device, FeatureAccessMode } from "../../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { FeatureSubFeatures } from "../../features/FeatureSubFeatures.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";

type DeviceSpecificSettingsProps = {
    device: Device;
};

export default function DeviceSpecificSettings({ device }: DeviceSpecificSettingsProps) {
    const { t } = useTranslation(["exposes"]);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const setDeviceOptions = useCallback(
        async (options: Record<string, unknown>) => {
            await sendMessage("bridge/request/device/options", { id: device.ieee_address, options });
        },
        [sendMessage, device.ieee_address],
    );

    return device.definition?.options?.length ? (
        <div className="list bg-base-100">
            <FeatureSubFeatures
                showEndpointLabels={true}
                feature={{
                    features: device.definition.options,
                    type: "composite",
                    name: "device_options",
                    label: "device_options",
                    property: "",
                    access: FeatureAccessMode.GET,
                }}
                device={device}
                deviceState={(bridgeInfo.config.devices[device.ieee_address] ?? {}) as unknown as Record<string, unknown>}
                onChange={setDeviceOptions}
                featureWrapperClass={FeatureWrapper}
            />
        </div>
    ) : (
        t("empty_exposes_definition")
    );
}
