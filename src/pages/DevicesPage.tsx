import React, { type JSX, useContext } from "react";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as DeviceApi from "../actions/DeviceApi.js";
import { type DeviceTableData, DevicesTable } from "../components/zigbee/DevicesTable.js";
import { useAppSelector } from "../hooks/store.js";
import type { DeviceState } from "../types.js";

export default function DevicesPage(): JSX.Element {
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const availability = useAppSelector((state) => state.availability);
    const availabilityFeatureEnabled = !!bridgeInfo.config.availability?.enabled;
    const homeassistantEnabled = !!bridgeInfo.config?.homeassistant?.enabled;

    const data = React.useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (const key in devices) {
            const device = devices[key];

            if (device.type !== "Coordinator") {
                const state = deviceStates[device.friendly_name] ?? ({} as DeviceState);
                const deviceAvailability = bridgeInfo.config.devices[device.ieee_address]?.availability;

                renderDevices.push({
                    device,
                    state,
                    availabilityState: availability[device.friendly_name] ?? "offline",
                    availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                });
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeInfo, availability]);

    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const renameDevice = async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
        await DeviceApi.renameDevice(sendMessage, from, to, homeassistantRename);
    };
    const configureDevice = async (name: string): Promise<void> => {
        await DeviceApi.configureDevice(sendMessage, name);
    };
    const removeDevice = async (dev: string, force: boolean, block: boolean): Promise<void> => {
        await DeviceApi.removeDevice(sendMessage, dev, force, block);
    };
    const interviewDevice = async (name: string): Promise<void> => {
        await DeviceApi.interviewDevice(sendMessage, name);
    };

    return (
        <DevicesTable
            devices={data}
            lastSeenType={bridgeInfo.config.advanced.last_seen}
            availabilityFeatureEnabled={availabilityFeatureEnabled}
            homeassistantEnabled={homeassistantEnabled}
            renameDevice={renameDevice}
            removeDevice={removeDevice}
            configureDevice={configureDevice}
            interviewDevice={interviewDevice}
        />
    );
}
