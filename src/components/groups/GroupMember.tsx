import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { RootState } from "../../store.js";
import { FeatureAccessMode, type FeatureWithAnySubFeatures, type Group } from "../../types.js";
import Button from "../button/Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { getScenesFeatures } from "../device-page/index.js";
import DeviceCard from "../device/DeviceCard.js";

interface GroupMemberProps {
    device: RootState["devices"][number];
    deviceState: RootState["deviceStates"][string];
    groupMember: Group["members"][number];
    lastSeenConfig: RootState["bridgeInfo"]["config"]["advanced"]["last_seen"];
    removeDeviceFromGroup(deviceIeee: string, endpoint: number): Promise<void>;
    setDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
    getDeviceState(ieee: string, value: Record<string, unknown>): Promise<void>;
}

export default function GroupMember(props: GroupMemberProps): JSX.Element {
    const { removeDeviceFromGroup, groupMember, device, deviceState, lastSeenConfig, setDeviceState, getDeviceState } = props;
    const { endpoint } = groupMember;
    const { t } = useTranslation("groups");

    const filteredFeatures = useMemo(() => {
        const features: FeatureWithAnySubFeatures[] = [];

        for (const feature of device.definition?.exposes ?? []) {
            const validFeature = getScenesFeatures(feature, deviceState);

            if (validFeature) {
                features.push(validFeature);
            }
        }

        return features;
    }, [device, deviceState]);

    return (
        <DeviceCard
            feature={{
                features: filteredFeatures,
                type: "composite",
                name: "group_member_features",
                label: "group_member_features",
                property: "",
                access: FeatureAccessMode.GET,
            }}
            device={device}
            endpoint={endpoint}
            deviceState={deviceState}
            onChange={async (value) => await setDeviceState(device.ieee_address, value as Record<string, unknown>)} // TODO: check this casting
            onRead={async (value) => await getDeviceState(device.ieee_address, value as Record<string, unknown>)} // TODO: check this casting
            featureWrapperClass={DashboardFeatureWrapper}
            lastSeenConfig={lastSeenConfig}
        >
            <Button<string>
                prompt
                onClick={async () => await removeDeviceFromGroup(device.ieee_address, endpoint)}
                className="btn btn-square btn-error btn-sm"
                title={t("remove_from_group")}
            >
                <FontAwesomeIcon icon={faTrash} />
            </Button>
        </DeviceCard>
    );
}
