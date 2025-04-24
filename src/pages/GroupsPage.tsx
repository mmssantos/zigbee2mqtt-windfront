import NiceModal from "@ebay/nice-modal-react";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type ChangeEvent, type JSX, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as GroupsApi from "../actions/GroupsApi.js";
import Button from "../components/button/Button.js";
import { Table } from "../components/grid/Table.js";
import { RenameGroupForm } from "../components/modal/components/RenameGroupModal.js";
import { useAppSelector } from "../hooks/store.js";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { GROUP_TABLE_PAGE_SIZE_KEY } from "../localStoreConsts.js";
import type { Group } from "../types.js";

interface GroupsPageState {
    newGroupName: string;
    newGroupId?: number;
}

function GroupsTable({ sendMessage }: { sendMessage: ApiSendMessage }) {
    const { t } = useTranslation(["groups"]);
    const groups = useAppSelector((state) => state.groups);

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    // biome-ignore lint/correctness/useExhaustiveDependencies: ???
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
                    <div className="stats shadow">
                        <div className="stat place-items-center">
                            <div className="stat-value">{group.members.length ?? 0}</div>
                            <div className="stat-desc">
                                {t("group_scenes")}
                                {": "}
                                {group.scenes?.length ?? 0}
                            </div>
                        </div>
                    </div>
                ),
                enableColumnFilter: false,
                enableSorting: false,
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
                                    onRename: async (oldName, newName) => await GroupsApi.renameGroup(sendMessage, oldName, newName),
                                })
                            }
                            title={t("rename_group")}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </Button>
                        <Button<string>
                            prompt
                            title={t("remove_group")}
                            item={group.friendly_name}
                            onClick={async (group) => await GroupsApi.removeGroup(sendMessage, group)}
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
        [sendMessage],
    );
    return <Table id="groups" columns={columns} data={groups} pageSizeStoreKey={GROUP_TABLE_PAGE_SIZE_KEY} />;
}

export default function GroupsPage() {
    const [state, setState] = useState<GroupsPageState>({ newGroupName: "", newGroupId: undefined });
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setState({ ...state, [name]: value });
    };
    const onGroupCreateSubmit = async (): Promise<void> => {
        const { newGroupName, newGroupId } = state;
        await GroupsApi.createGroup(sendMessage, newGroupName, newGroupId);
    };

    const renderGroupCreationForm = (): JSX.Element => {
        const { t } = useTranslation(["groups"]);
        const { newGroupName, newGroupId } = state;
        return (
            <div className="card">
                <div className="card-body">
                    <div className="input-group">
                        <label htmlFor="newGroupName" className="sr-only">
                            {t("new_group_name")}
                        </label>
                        <input
                            onChange={changeHandler}
                            value={newGroupName}
                            required
                            type="text"
                            name="newGroupName"
                            className="form-control"
                            id="newGroupName"
                            placeholder={t("new_group_name_placeholder")}
                        />

                        <label htmlFor="newGroupName" className="sr-only">
                            {t("new_group_id")}
                        </label>
                        <input
                            onChange={changeHandler}
                            value={newGroupId === undefined ? "" : newGroupId}
                            type="number"
                            name="newGroupId"
                            className="form-control"
                            id="newGroupId"
                            placeholder={t("new_group_id_placeholder")}
                        />
                        <Button<void> onClick={onGroupCreateSubmit} className="btn btn-primary form-control">
                            {t("create_group")}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderGroupCreationForm()}
            <GroupsTable sendMessage={sendMessage} />
        </>
    );
}
