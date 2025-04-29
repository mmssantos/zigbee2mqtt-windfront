import { useContext } from "react";
import type { CompositeFeature, Device, DeviceState } from "../../../types.js";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import { Feature } from "../../features/Feature.js";
import FeatureWrapper from "../../features/FeatureWrapper.js";

type ExposesProps = {
    device: Device;
};

export function Exposes(props: ExposesProps) {
    const { device } = props;
    const { t } = useTranslation(["exposes"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const deviceStates = useAppSelector((state) => state.deviceStates);

    return device.definition?.exposes?.length ? (
        <div className="stats flex flex-row flex-wrap shadow">
            <Feature
                feature={{ features: device.definition.exposes, type: "composite" } as CompositeFeature}
                device={device}
                deviceState={deviceStates[device.friendly_name] ?? ({} as DeviceState)}
                onChange={async (value) => {
                    await sendMessage<"{friendlyNameOrId}/set">(
                        // @ts-expect-error templated API endpoint
                        `${device.ieee_address}/set`,
                        value,
                    );
                }}
                onRead={async (value) => {
                    await sendMessage<"{friendlyNameOrId}/get">(
                        // @ts-expect-error templated API endpoint
                        `${device.ieee_address}/get`,
                        value,
                    );
                }}
                parentFeatures={[]}
                featureWrapperClass={FeatureWrapper}
            />
        </div>
    ) : (
        t("empty_exposes_definition")
    );
}
