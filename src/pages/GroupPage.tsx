import { useParams } from "react-router";
import { AddScene } from "../components/device-page/AddScene.js";
import { RecallRemove } from "../components/device-page/RecallRemove.js";
import { AddDeviceToGroup } from "../components/groups/AddDeviceToGroup.js";
import { DeviceGroup } from "../components/groups/DeviceGroup.js";
import { useAppSelector } from "../hooks/useApp.js";
import type { DeviceState } from "../types.js";

type UrlParams = {
    groupId?: string;
};

export default function GroupPage() {
    const params = useParams<UrlParams>();
    const groupId = Number.parseInt(params.groupId!, 10);
    const group = useAppSelector(
        (state) =>
            state.groups.find((g) => g.id === groupId) || {
                id: groupId,
                friendly_name: "Unknown group",
                members: [],
                scenes: [],
                description: undefined,
            },
    );

    return (
        <>
            <div className="collapse collapse-arrow bg-base-100 border-base-300 border mb-3">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold text-center">
                    {group.friendly_name} (#{group.id})
                </div>
                <div className="collapse-content">
                    <div className="flex flex-row flex-wrap justify-evenly gap-4">
                        <div className="flex-1">
                            <AddDeviceToGroup group={group} />
                        </div>
                        <div className="flex-1">
                            <RecallRemove target={group} deviceState={{} as DeviceState} />
                        </div>
                        <div className="flex-1">
                            <AddScene target={group} deviceState={{} as DeviceState} />
                        </div>
                    </div>
                </div>
            </div>
            <DeviceGroup group={group} />
        </>
    );
}
