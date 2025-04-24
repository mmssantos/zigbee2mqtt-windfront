import NiceModal from "@ebay/nice-modal-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as DeviceApi from "../actions/DeviceApi.js";
import * as StateApi from "../actions/StateApi.js";
import Button from "../components/button/Button.js";
import DashboardDevice from "../components/dashboard-page/DashboardDevice.js";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper.js";
import { onlyValidFeaturesForDashboard } from "../components/dashboard-page/index.js";
import { DeviceControlEditName } from "../components/device-control/DeviceControlEditName.js";
import { RemoveDeviceModal } from "../components/modal/components/RemoveDeviceModal.js";
import { useAppSelector } from "../hooks/store.js";
import type { Devices } from "../store.js";
import type { CompositeFeature, Device, DeviceState, FriendlyName, GenericExposedFeature } from "../types.js";

type DeviceStateAndFilteredFeatures = {
    device: Device;
    deviceState: DeviceState;
    filteredFeatures: GenericExposedFeature[];
};
function filterDeviceByFeatures(devices: Devices, deviceStates: Record<FriendlyName, DeviceState>): DeviceStateAndFilteredFeatures[] {
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
        await DeviceApi.renameDevice(sendMessage, from, to, homeassistantRename);
    };
    const removeDevice = async (dev: string, force: boolean, block: boolean): Promise<void> => {
        await DeviceApi.removeDevice(sendMessage, dev, force, block);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3 mt-2 px-2">
            {/** TODO: this is re-rendering rather often */}
            {filterDeviceByFeatures(devices, deviceStates).map(({ device, deviceState, filteredFeatures }) => (
                <ul className="list rounded-box shadow-md" key={device.ieee_address}>
                    <DashboardDevice
                        feature={{ features: filteredFeatures } as CompositeFeature}
                        device={device}
                        deviceState={deviceState}
                        onChange={async (_endpoint, value) => await StateApi.setDeviceState(sendMessage, device.friendly_name, value)}
                        onRead={async (_endpoint, value) => await StateApi.getDeviceState(sendMessage, device.friendly_name, value)}
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
