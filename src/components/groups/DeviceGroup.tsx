import { type JSX, useContext } from "react";
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
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const removeMember = async (deviceIeee: string, endpoint: Endpoint): Promise<void> =>
        await sendMessage("bridge/request/group/members/remove", { device: deviceIeee, endpoint, group: group.id.toString() });
    const setDeviceState = async (ieee: string, value: Record<string, unknown>): Promise<void> => {
        await sendMessage<"{friendlyNameOrId}/set">(
            // @ts-expect-error templated API endpoint
            `${ieee}/set`,
            value,
        );
    };
    const getDeviceState = async (ieee: string, value: Record<string, unknown>): Promise<void> => {
        await sendMessage<"{friendlyNameOrId}/get">(
            // @ts-expect-error templated API endpoint
            `${ieee}/get`,
            value,
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3 mt-2">
            {group.members.map((groupMembershipInfo) => (
                <ul className="list rounded-box shadow-md" key={`${groupMembershipInfo.ieee_address}-${groupMembershipInfo.endpoint}`}>
                    <DeviceGroupRow
                        removeDeviceFromGroup={removeMember}
                        devices={devices}
                        groupMember={groupMembershipInfo}
                        deviceStates={deviceStates}
                        bridgeInfo={bridgeInfo}
                        setDeviceState={setDeviceState}
                        getDeviceState={getDeviceState}
                    />
                </ul>
            ))}
        </div>
    );
}
