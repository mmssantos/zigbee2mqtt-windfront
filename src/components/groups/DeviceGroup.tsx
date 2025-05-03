import { type JSX, useCallback, useContext, useMemo } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Endpoint, Group } from "../../types.js";
import { DeviceGroupRow } from "./DeviceGroupRow.js";

export interface DeviceGroupProps {
    group: Group;
}

export function DeviceGroup(props: DeviceGroupProps): JSX.Element {
    const { group } = props;
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const lastSeenConfig = useAppSelector((state) => state.bridgeInfo.config.advanced.last_seen);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const removeMember = useCallback(
        async (deviceIeee: string, endpoint: Endpoint): Promise<void> =>
            await sendMessage("bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() }),
        [sendMessage, group.id],
    );
    const setDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/set`,
                value,
            );
        },
        [sendMessage],
    );
    const getDeviceState = useCallback(
        async (ieee: string, value: Record<string, unknown>): Promise<void> => {
            await sendMessage<"{friendlyNameOrId}/get">(
                // @ts-expect-error templated API endpoint
                `${ieee}/get`,
                value,
            );
        },
        [sendMessage],
    );
    const groupMembers = useMemo(() => {
        const members: JSX.Element[] = [];

        for (const member of group.members) {
            const device = devices.find((device) => device.ieee_address === member.ieee_address);

            if (device) {
                members.push(
                    <ul className="list rounded-box shadow-md" key={`${member.ieee_address}-${member.endpoint}`}>
                        <DeviceGroupRow
                            removeDeviceFromGroup={removeMember}
                            device={device}
                            groupMember={member}
                            deviceState={deviceStates[device.friendly_name] ?? {}}
                            lastSeenConfig={lastSeenConfig}
                            setDeviceState={setDeviceState}
                            getDeviceState={getDeviceState}
                        />
                    </ul>,
                );
            }
        }

        return members;
    }, [group, devices, lastSeenConfig, deviceStates, removeMember, setDeviceState, getDeviceState]);

    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3">{groupMembers}</div>;
}
