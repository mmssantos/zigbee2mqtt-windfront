import NiceModal from "@ebay/nice-modal-react";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import InputField from "../components/form-fields/InputField.js";
import Table from "../components/grid/Table.js";
import { RenameGroupForm } from "../components/modal/components/RenameGroupModal.js";
import { useAppSelector } from "../hooks/useApp.js";
import { GROUP_TABLE_PAGE_SIZE_KEY } from "../localStoreConsts.js";
import type { Group } from "../types.js";

export default function GroupsPage() {
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [newGroupId, setNewGroupId] = useState<string>();
    const groups = useAppSelector((state) => state.groups);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["groups", "common"]);

    const onGroupCreateSubmit = async (): Promise<void> => {
        const payload: Zigbee2MQTTAPI["bridge/request/group/add"] = { friendly_name: newGroupName };

        if (newGroupId !== undefined) {
            payload.id = newGroupId;
        }

        await sendMessage("bridge/request/group/add", payload);
    };

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const columns = useMemo<ColumnDef<Group, any>[]>(
        () => [
            {
                id: "group_id",
                header: t("group_id"),
                accessorFn: (group) => group.id,
                cell: ({ row: { original: group } }) => (
                    <Link to={`/group/${group.id}`} className="link link-hover">
                        {group.id}
                    </Link>
                ),
            },
            {
                id: "friendly_name",
                header: t("group_name"),
                accessorFn: (group) => group.friendly_name,
                cell: ({ row: { original: group } }) => (
                    <Link to={`/group/${group.id}`} className="link link-hover">
                        {group.friendly_name}
                    </Link>
                ),
            },
            {
                id: "members",
                header: t("group_members"),
                accessorFn: (group) => group.members.length ?? 0,
                cell: ({ row: { original: group } }) => (
                    <div className="flex flex-col items-center gap-3">
                        {group.members.length ?? 0}
                        <div className="flex flex-row gap-1 mt-2">
                            <span className="badge badge-soft badge-ghost cursor-default">
                                {t("group_scenes")}
                                {": "}
                                {group.scenes?.length ?? 0}
                            </span>
                        </div>
                    </div>
                ),
                enableColumnFilter: false,
            },
            {
                header: "",
                id: "actions",
                cell: ({ row: { original: group } }) => (
                    <div className="join float-right">
                        <Button<void>
                            className="btn btn-primary join-item"
                            onClick={() =>
                                NiceModal.show(RenameGroupForm, {
                                    name: group.friendly_name,
                                    onRename: async (from, to) => await sendMessage("bridge/request/group/rename", { from, to }),
                                })
                            }
                            title={t("rename_group")}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button<string>
                            prompt
                            title={t("remove_group")}
                            item={group.id.toString()}
                            onClick={async (id) => await sendMessage("bridge/request/group/remove", { id })}
                            className="btn btn-error join-item"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </Button>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [sendMessage, t],
    );

    return (
        <div className="mt-2 px-2">
            <div className="hero bg-base-200">
                <div className="hero-content text-center">
                    <div className="flex flex-row flex-wrap gap-2">
                        <InputField
                            type="text"
                            name="group_name"
                            label={t("new_group_name")}
                            defaultValue={newGroupName}
                            placeholder={t("new_group_name_placeholder")}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            required
                        />
                        <InputField
                            type="number"
                            name="group_id"
                            label={t("new_group_id")}
                            defaultValue={newGroupId}
                            detail={t("common:optional")}
                            min={0}
                            max={255}
                            onChange={(e) => setNewGroupId(e.target.value ? undefined : e.target.value)}
                        />
                        <Button<void> onClick={onGroupCreateSubmit} className="btn btn-primary self-center" disabled={!newGroupName}>
                            {t("create_group")}
                        </Button>
                    </div>
                </div>
            </div>
            <Table id="all-groups" columns={columns} data={groups} pageSizeStoreKey={GROUP_TABLE_PAGE_SIZE_KEY} />
        </div>
    );
}
