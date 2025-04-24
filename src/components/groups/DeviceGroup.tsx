import { type JSX, useContext } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as GroupsApi from "../../actions/GroupsApi.js";
import * as StateApi from "../../actions/StateApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Endpoint, FriendlyName, Group } from "../../types.js";
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
    const removeMember = async (device: string, endpoint: Endpoint): Promise<void> =>
        await GroupsApi.removeDeviceFromGroup(sendMessage, device, endpoint, group.friendly_name);
    const setDeviceState = async (friendlyName: FriendlyName, value: Record<string, unknown>): Promise<void> => {
        await StateApi.setDeviceState(sendMessage, friendlyName, value);
    };
    const getDeviceState = async (friendlyName: FriendlyName, value: Record<string, unknown>): Promise<void> => {
        await StateApi.getDeviceState(sendMessage, friendlyName, value);
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
