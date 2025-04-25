import { useContext } from "react";
import * as StateApi from "../../actions/StateApi.js";
import type { CompositeFeature, Device, DeviceState } from "../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/store.js";
import { Feature } from "../features/Feature.js";
import FeatureWrapper from "../features/FeatureWrapper.js";

type ExposesProps = {
    device: Device;
};

export function Exposes(props: ExposesProps) {
    const { device } = props;
    const { t } = useTranslation(["exposes"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppSelector((state) => state.deviceStates);

    if (device.definition?.exposes?.length) {
        const deviceState = deviceStates[device.friendly_name] ?? ({} as DeviceState);

        return (
            <Feature
                // showEndpointLabels={true}
                feature={{ features: device.definition.exposes, type: "composite" } as CompositeFeature}
                device={device}
                deviceState={deviceState}
                onChange={async (_endpoint, value) => {
                    await StateApi.setDeviceState(sendMessage, device.friendly_name, value);
                }}
                onRead={async (_endpoint, value) => {
                    await StateApi.getDeviceState(sendMessage, device.friendly_name, value);
                }}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />
        );
    }

    return t("empty_exposes_definition");
}
