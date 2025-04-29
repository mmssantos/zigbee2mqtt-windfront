import NiceModal from "@ebay/nice-modal-react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import DashboardDevice from "../components/dashboard-page/DashboardDevice.js";
import DashboardFeatureWrapper from "../components/dashboard-page/DashboardFeatureWrapper.js";
import { getDashboardFeatures } from "../components/dashboard-page/index.js";
import { DeviceControlEditName } from "../components/device-control/DeviceControlEditName.js";
import { RemoveDeviceModal } from "../components/modal/components/RemoveDeviceModal.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { CompositeFeature, Device, DeviceState, GenericFeature } from "../types.js";

type DeviceStateAndFilteredFeatures = {
    device: Device;
    deviceState: DeviceState;
    filteredFeatures: GenericFeature[];
};

export default function Dashboard() {
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const devices = useAppSelector((state) => state.devices);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("zigbee");

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: false,
            });
        },
        [sendMessage],
    );

    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );

    const filteredDevices = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (const device of devices) {
            if (!device.disabled && device.supported) {
                const deviceState = deviceStates[device.friendly_name] ?? {};
                const filteredFeatures: DeviceStateAndFilteredFeatures["filteredFeatures"] = [];

                if (device.definition?.exposes) {
                    for (const feature of device.definition.exposes) {
                        const validFeature = getDashboardFeatures(feature, deviceState);

                        if (validFeature) {
                            filteredFeatures.push(validFeature);
                        }
                    }
                }

                if (filteredFeatures.length > 0) {
                    filteredDevices.push(
                        <ul className="list rounded-box shadow-md" key={device.ieee_address}>
                            <DashboardDevice
                                feature={{ features: filteredFeatures } as CompositeFeature}
                                device={device}
                                deviceState={deviceState}
                                onChange={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/set">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/set`,
                                        value,
                                    )
                                }
                                onRead={async (value) =>
                                    await sendMessage<"{friendlyNameOrId}/get">(
                                        // @ts-expect-error templated API endpoint
                                        `${device.ieee_address}/get`,
                                        value,
                                    )
                                }
                                featureWrapperClass={DashboardFeatureWrapper}
                                lastSeenConfig={bridgeConfig.advanced.last_seen}
                                controls={
                                    <div className="join">
                                        <DeviceControlEditName
                                            device={device}
                                            renameDevice={renameDevice}
                                            homeassistantEnabled={bridgeConfig.homeassistant.enabled}
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
                        </ul>,
                    );
                }
            }
        }

        return filteredDevices;
    }, [devices, deviceStates, bridgeConfig.advanced.last_seen, bridgeConfig.homeassistant.enabled, sendMessage, removeDevice, renameDevice, t]);

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3 mt-2 px-2">{filteredDevices}</div>;
}
