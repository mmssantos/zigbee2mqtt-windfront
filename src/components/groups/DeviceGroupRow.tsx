import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import type { WithBridgeInfo, WithDeviceStates, WithDevices } from "../../store.js";
import type { CompositeFeature, DeviceState, Endpoint, GenericFeature, Group } from "../../types.js";
import Button from "../button/Button.js";
import DashboardDevice from "../dashboard-page/DashboardDevice.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { onlyValidFeaturesForScenes } from "../device-page/index.js";

interface DeviceGroupRowProps extends WithDevices, WithDeviceStates, WithBridgeInfo {
    groupMember: Group["members"][number];
    removeDeviceFromGroup(deviceFriendlyName: string, endpoint: Endpoint): Promise<void>;
    setDeviceState(friendlyName: string, value: Record<string, unknown>): Promise<void>;
    getDeviceState(friendlyName: string, value: Record<string, unknown>): Promise<void>;
}

export function DeviceGroupRow(props: DeviceGroupRowProps): JSX.Element {
    const { t } = useTranslation("devicePage");
    const { removeDeviceFromGroup, groupMember, devices, deviceStates, bridgeInfo, setDeviceState, getDeviceState } = props;
    const { endpoint, ieee_address } = groupMember;
    const device = devices[ieee_address] ?? { ieee_address, friendly_name: t("unknown_device") };
    const deviceState = deviceStates[device.friendly_name] ?? ({} as DeviceState);
    const filteredFeatures: (GenericFeature | CompositeFeature)[] = [];

    for (const feature of device.definition?.exposes ?? []) {
        const validFeature = onlyValidFeaturesForScenes(feature, deviceState);

        if (validFeature) {
            filteredFeatures.push(validFeature);
        }
    }

    return (
        <DashboardDevice
            feature={{ features: filteredFeatures } as CompositeFeature}
            device={device}
            endpoint={endpoint}
            deviceState={deviceState}
            onChange={async (_endpoint, value) => await setDeviceState(device.friendly_name, value)}
            onRead={async (_endpoint, value) => await getDeviceState(device.friendly_name, value)}
            featureWrapperClass={DashboardFeatureWrapper}
            lastSeenType={bridgeInfo.config.advanced.last_seen}
            controls={
                <Button<string>
                    prompt
                    onClick={async () => await removeDeviceFromGroup(device.friendly_name, endpoint)}
                    className="btn btn-square btn-error btn-sm"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            }
        />
    );
}
