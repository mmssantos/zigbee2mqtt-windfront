import NiceModal from "@ebay/nice-modal-react";
import { faDownLong, faMagnifyingGlass, faQuestion, faRoute, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { groupBy } from "lodash";
import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as MapApi from "../actions/MapApi.js";
import Button from "../components/button/Button.js";
import { DeviceImage } from "../components/device-image/DeviceImage.js";
import { DebouncedInput } from "../components/form-fields/DebouncedInput.js";
import { type GraphRaw, ZigbeeRelationship } from "../components/map/types.js";
import { MapHelpModal } from "../components/modal/components/MapHelpModal.js";
import { Lqi } from "../components/value-decorators/Lqi.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import { useAppSelector } from "../hooks/store.js";
import { getDeviceDetailsLink, toHex } from "../utils.js";

const RELATION_TMAP = {
    [ZigbeeRelationship.NeighborIsParent]: "parents",
    [ZigbeeRelationship.NeighborIsAChild]: "children",
    [ZigbeeRelationship.NeighborIsASibling]: "siblings",
    [ZigbeeRelationship.NoneOfTheAbove]: "zigbee:none",
    // Z2M is currently skipping > 3, so this is never present
    [ZigbeeRelationship.NeighborIsPreviousChild]: "previous_children",
};

export default function MapHierarchy() {
    const isLoading = useAppSelector((state) => state.networkGraphIsLoading);
    const graph = useAppSelector((state) => state.networkGraph);
    const devices = useAppSelector((state) => state.devices);
    const dispatch = useDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("map");
    const [filterValue, setFilterValue] = useState<string>("");

    const listRelations = (relations: GraphRaw["links"]) => {
        const listedRelations: JSX.Element[] = [];

        for (const relation of relations) {
            const device = devices[relation.source.ieeeAddr];

            listedRelations.push(
                <li
                    key={relation.source.ieeeAddr}
                    title={`${t("zigbee:ieee_address")}: ${device.ieee_address} | ${t("zigbee:network_address")}: ${toHex(device.network_address, 4)} (${device.network_address})`}
                >
                    <Link to="#">
                        <DeviceImage disabled={false} device={device} className="size-8" noIndicator={true} />
                        {device.friendly_name}
                        <span className="badge badge-ghost">
                            <Lqi value={relation.linkquality} />
                        </span>
                        <span className="badge badge-ghost" title={t("depth")}>
                            <FontAwesomeIcon icon={faRoute} />
                            {relation.depth === 255 ? "N/A" : relation.depth}
                        </span>
                    </Link>
                </li>,
            );
        }

        return listedRelations;
    };

    const groupRelations = (graph: GraphRaw, node: GraphRaw["nodes"][number]) => {
        const grouped = groupBy(
            graph.links.filter((link) => link.target.ieeeAddr === node.ieeeAddr),
            (link) => link.relationship,
        );
        const groupedRelations: JSX.Element[] = [];

        for (const key in grouped) {
            const relations = grouped[key];

            groupedRelations.push(
                <li key={key}>
                    <details>
                        <summary>{t(RELATION_TMAP[key])}</summary>
                        <ul>{listRelations(relations)}</ul>
                    </details>
                </li>,
            );
        }

        return groupedRelations;
    };

    const sortNodes = () => {
        const sortedNodes: JSX.Element[] = [];

        for (const node of graph.nodes) {
            const device = devices[node.ieeeAddr];

            if (!filterValue || node.friendlyName.toLowerCase().includes(filterValue.toLowerCase())) {
                sortedNodes.push(
                    <ul className="menu bg-base-200 rounded-box w-full" key={node.friendlyName}>
                        <li
                            title={`${t("zigbee:ieee_address")}: ${node.ieeeAddr} | ${t("zigbee:network_address")}: ${toHex(node.networkAddress, 4)} (${node.networkAddress})`}
                        >
                            {node.type === "Coordinator" ? (
                                <Link to="/settings/about">
                                    <DeviceImage disabled={false} device={device} className="size-10" noIndicator={true} />
                                    {node.friendlyName}
                                </Link>
                            ) : (
                                <Link to={getDeviceDetailsLink(node.ieeeAddr)} className="link link-hover link-primary">
                                    <DeviceImage disabled={false} device={device} className="size-10" noIndicator={true} />
                                    {node.friendlyName}
                                    <span className="badge badge-ghost">
                                        <PowerSource device={device} showLevel={false} />
                                    </span>
                                </Link>
                            )}
                        </li>
                        {groupRelations(graph, node)}
                    </ul>,
                );
            }
        }

        sortedNodes.sort((a, b) => (a.key === "Coordinator" ? -1 : a.key!.localeCompare(b.key!)));

        return sortedNodes;
    };

    return isLoading ? (
        <>
            <div className="flex flex-row justify-center items-center gap-2 p-6">
                <span className="loading loading-infinity loading-xl" />
            </div>
            <div className="flex flex-row justify-center items-center gap-2 p-6">{t("loading")}</div>
        </>
    ) : (
        <>
            <div className="flex flex-row justify-center items-center p-6 join">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                <label className="input w-64 join-item">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <DebouncedInput
                        className=""
                        type="search"
                        onChange={(value) => setFilterValue(value.toString())}
                        placeholder={t("common:enter_search_criteria")}
                        value={filterValue}
                        disabled={graph.nodes.length === 0}
                    />
                    <kbd
                        className="kbd kbd-sm cursor-pointer"
                        onClick={() => setFilterValue("")}
                        onKeyUp={(e) => {
                            if (e.key === "enter") {
                                setFilterValue("");
                            }
                        }}
                        title={t("common:clear")}
                    >
                        x
                    </kbd>
                </label>
                <Button
                    className="btn btn-primary btn-square join-item"
                    onClick={async () => await MapApi.networkMapRequest(sendMessage, dispatch)}
                    title={graph.nodes.length > 0 ? t("refresh_data") : t("load")}
                >
                    {graph.nodes.length > 0 ? <FontAwesomeIcon icon={faSync} /> : <FontAwesomeIcon icon={faDownLong} />}
                </Button>
                <Button<void> className="btn btn-info btn-square join-item" onClick={() => NiceModal.show(MapHelpModal)} title={t("help")}>
                    <FontAwesomeIcon icon={faQuestion} />
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 px-6">{sortNodes()}</div>
        </>
    );
}
