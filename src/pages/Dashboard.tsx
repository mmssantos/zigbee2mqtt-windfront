import NiceModal from "@ebay/nice-modal-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import DashboardDevice from "../components/dashboard-page/DashboardDevice.js";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper.js";
import { onlyValidFeaturesForDashboard } from "../components/dashboard-page/index.js";
import { DeviceControlEditName } from "../components/device-control/DeviceControlEditName.js";
import { RemoveDeviceModal } from "../components/modal/components/RemoveDeviceModal.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { WithDeviceStates, WithDevices } from "../store.js";
import type { CompositeFeature, Device, DeviceState, GenericFeature } from "../types.js";

type DeviceStateAndFilteredFeatures = {
    device: Device;
    deviceState: DeviceState;
    filteredFeatures: GenericFeature[];
};

function filterDeviceByFeatures(devices: WithDevices["devices"], deviceStates: WithDeviceStates["deviceStates"]): DeviceStateAndFilteredFeatures[] {
    const filteredDevices: DeviceStateAndFilteredFeatures[] = [];

    for (const key in devices) {
        const device = devices[key];

        if (!device.disabled && device.supported) {
            const deviceState = deviceStates[device.friendly_name] ?? {};
            const filteredFeatures: DeviceStateAndFilteredFeatures["filteredFeatures"] = [];

            for (const feature of device.definition?.exposes ?? []) {
                const validFeature = onlyValidFeaturesForDashboard(feature, deviceState);

                if (validFeature) {
                    filteredFeatures.push(validFeature);
                }
            }

            if (filteredFeatures.length > 0) {
                filteredDevices.push({ device, deviceState, filteredFeatures });
            }
        }
    }

    filteredDevices.sort((a, b) => a.device.friendly_name.localeCompare(b.device.friendly_name));

    return filteredDevices;
}

export default function Dashboard() {
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const devices = useAppSelector((state) => state.devices);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("zigbee");
    const renameDevice = async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
        await sendMessage("bridge/request/device/rename", {
            from,
            to,
            homeassistant_rename: homeassistantRename,
            last: false,
        });
    };
    const removeDevice = async (id: string, force: boolean, block: boolean): Promise<void> => {
        await sendMessage("bridge/request/device/remove", { id, force, block });
    };
    const filteredDevices = useMemo(() => filterDeviceByFeatures(devices, deviceStates), [devices, deviceStates]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3 mt-2 px-2">
            {/** TODO: this is re-rendering rather often */}
            {filteredDevices.map(({ device, deviceState, filteredFeatures }) => (
                <ul className="list rounded-box shadow-md" key={device.ieee_address}>
                    <DashboardDevice
                        feature={{ features: filteredFeatures } as CompositeFeature}
                        device={device}
                        deviceState={deviceState}
                        onChange={async (_endpoint, value) =>
                            await sendMessage<"{friendlyNameOrId}/set">(
                                // @ts-expect-error templated API endpoint
                                `${device.ieee_address}/set`,
                                value,
                            )
                        }
                        onRead={async (_endpoint, value) =>
                            await sendMessage<"{friendlyNameOrId}/get">(
                                // @ts-expect-error templated API endpoint
                                `${device.ieee_address}/get`,
                                value,
                            )
                        }
                        featureWrapperClass={DashboardFeatureWrapper}
                        lastSeenType={bridgeInfo.config.advanced.last_seen}
                        controls={
                            <div className="join">
                                <DeviceControlEditName
                                    device={device}
                                    renameDevice={renameDevice}
                                    homeassistantEnabled={bridgeInfo.config.homeassistant?.enabled ?? false}
                                    style="btn-primary btn-square btn-sm join-item"
                                />
                                <Button<void>
                                    onClick={() => NiceModal.show(RemoveDeviceModal, { device, removeDevice })}
                                    className="btn btn-error btn-square btn-sm join-item"
                                    title={t("remove_device")}
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </div>
                        }
                    />
                </ul>
            ))}
        </div>
    );
}
