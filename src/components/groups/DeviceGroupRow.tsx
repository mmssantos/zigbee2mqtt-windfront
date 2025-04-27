import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo } from "react";
import type { RootState } from "../../store.js";
import type { CompositeFeature, Endpoint, GenericFeature, Group } from "../../types.js";
import Button from "../button/Button.js";
import DashboardDevice from "../dashboard-page/DashboardDevice.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { onlyValidFeaturesForScenes } from "../device-page/index.js";

interface DeviceGroupRowProps {
    device: RootState["devices"][number];
    deviceState: RootState["deviceStates"][string];
    groupMember: Group["members"][number];
    lastSeenConfig: RootState["bridgeInfo"]["config"]["advanced"]["last_seen"];
    removeDeviceFromGroup(deviceIeee: string, endpoint: Endpoint): Promise<void>;
    setDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
    getDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
}

export function DeviceGroupRow(props: DeviceGroupRowProps): JSX.Element {
    const { removeDeviceFromGroup, groupMember, device, deviceState, lastSeenConfig, setDeviceState, getDeviceState } = props;
    const { endpoint } = groupMember;

    const filteredFeatures = useMemo(() => {
        const features: (GenericFeature | CompositeFeature)[] = [];

        for (const feature of device.definition?.exposes ?? []) {
            const validFeature = onlyValidFeaturesForScenes(feature, deviceState);

            if (validFeature) {
                features.push(validFeature);
            }
        }

        return features;
    }, [device, deviceState]);

    return (
        <DashboardDevice
            feature={{ features: filteredFeatures } as CompositeFeature}
            device={device}
            endpoint={endpoint}
            deviceState={deviceState}
            onChange={async (_endpoint, value) => await setDeviceState(device.ieee_address, value as Record<string, unknown>)} // TODO: check this casting
            onRead={async (_endpoint, value) => await getDeviceState(device.ieee_address, value as Record<string, unknown>)} // TODO: check this casting
            featureWrapperClass={DashboardFeatureWrapper}
            lastSeenConfig={lastSeenConfig}
            controls={
                <Button<string>
                    prompt
                    onClick={async () => await removeDeviceFromGroup(device.ieee_address, endpoint)}
                    className="btn btn-square btn-error btn-sm"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            }
        />
    );
}
