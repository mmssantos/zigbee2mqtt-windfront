import { type JSX, useCallback, useContext, useMemo } from "react";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import { type DeviceTableData, DevicesTable } from "../components/zigbee/DevicesTable.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { DeviceState } from "../types.js";

export default function DevicesPage(): JSX.Element {
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const availability = useAppSelector((state) => state.availability);
    const availabilityFeatureEnabled = !!bridgeInfo.config.availability?.enabled;
    const homeassistantEnabled = !!bridgeInfo.config?.homeassistant?.enabled;

    const data = useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (const key in devices) {
            const device = devices[key];

            if (device.type !== "Coordinator") {
                const state = deviceStates[device.friendly_name] ?? ({} as DeviceState);
                const deviceAvailability = bridgeInfo.config.devices[device.ieee_address]?.availability;

                renderDevices.push({
                    device,
                    state,
                    availabilityState: availability[device.friendly_name] ?? { state: "offline" },
                    availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                });
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeInfo, availability]);

    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: undefined,
            });
        },
        [sendMessage],
    );
    const configureDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/configure", { id });
        },
        [sendMessage],
    );
    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );
    const interviewDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/interview", { id });
        },
        [sendMessage],
    );

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
