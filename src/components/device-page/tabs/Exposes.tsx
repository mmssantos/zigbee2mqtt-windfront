import { useCallback, useContext } from "react";
import { type Device, type DeviceState, FeatureAccessMode } from "../../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { Feature } from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";

type ExposesProps = {
    device: Device;
};

export default function Exposes(props: ExposesProps) {
    const { device } = props;
    const { t } = useTranslation(["exposes"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppSelector((state) => state.deviceStates);

    const onChange = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/set`,
                value,
            );
        },
        [sendMessage, device.ieee_address],
    );

    const onRead = useCallback(
        async (value: Record<string, unknown>) => {
            await sendMessage<"{friendlyNameOrId}/get">(
                // @ts-expect-error templated API endpoint
                `${device.ieee_address}/get`,
                value,
            );
        },
        [sendMessage, device.ieee_address],
    );

    return device.definition?.exposes?.length ? (
        <div className="list bg-base-100">
            <Feature
                feature={{
                    features: device.definition.exposes,
                    type: "composite",
                    name: "device_exposes",
                    label: "device_exposes",
                    property: "",
                    access: FeatureAccessMode.GET,
                }}
                device={device}
                deviceState={deviceStates[device.friendly_name] ?? ({} as DeviceState)}
                onChange={onChange}
                onRead={onRead}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />
        </div>
    ) : (
        t("empty_exposes_definition")
    );
}
