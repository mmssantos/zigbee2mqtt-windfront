import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { AddScene } from "../components/device-page/AddScene.js";
import { RecallRemove } from "../components/device-page/RecallRemove.js";
import { AddDeviceToGroup } from "../components/groups/AddDeviceToGroup.js";
import { DeviceGroup } from "../components/groups/DeviceGroup.js";
import { useAppSelector } from "../hooks/store.js";
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
    const { t } = useTranslation(["groups"]);

    return (
        <div className="mt-2 px-2">
            <div className="hero bg-base-200">
                <div className="hero-content text-center">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {t("group_name")}: {group.friendly_name} (#{group.id})
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-3 my-2">
                            <div>
                                <AddDeviceToGroup group={group} />
                            </div>
                            <div>
                                <RecallRemove target={group} deviceState={{} as DeviceState} />
                            </div>
                            <div>
                                <AddScene target={group} deviceState={{} as DeviceState} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeviceGroup group={group} />
        </div>
    );
}
