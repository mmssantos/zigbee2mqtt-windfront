import { faDownLong, faMagnifyingGlass, faMarker, faQuestionCircle, faRoute, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { groupBy } from "lodash";
import { type JSX, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/Button.js";
import { DeviceImage } from "../components/device/DeviceImage.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import { Lqi } from "../components/value-decorators/Lqi.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { setNetworkGraphIsLoading } from "../store.js";
import { toHex } from "../utils.js";

const enum ZigbeeRelationship {
    NeighborIsParent = 0x00,
    NeighborIsAChild = 0x01,
    NeighborIsASibling = 0x02,
    NoneOfTheAbove = 0x03,
    NeighborIsPreviousChild = 0x04,
}

const RELATION_TMAP = {
    [ZigbeeRelationship.NeighborIsParent]: "parents",
    [ZigbeeRelationship.NeighborIsAChild]: "children",
    [ZigbeeRelationship.NeighborIsASibling]: "siblings",
    [ZigbeeRelationship.NoneOfTheAbove]: "zigbee:none",
    // Z2M is currently skipping > 3, so this is never present
    [ZigbeeRelationship.NeighborIsPreviousChild]: "previous_children",
};

export default function NetworkPage() {
    const isLoading = useAppSelector((state) => state.networkGraphIsLoading);
    const graph = useAppSelector((state) => state.networkGraph);
    const devices = useAppSelector((state) => state.devices);
    const dispatch = useAppDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("network");
    const [filterValue, setFilterValue] = useState<string>("");
    const [highlightValue, setHighlightValue] = useState<string>("");

    const highlighted = useCallback(
        (friendlyName: string) => {
            return highlightValue && friendlyName.toLowerCase().includes(highlightValue.toLowerCase()) ? "bg-accent text-accent-content" : "";
        },
        [highlightValue],
    );

    const listRelations = useCallback(
        (relations: Zigbee2MQTTNetworkMap["links"]) => {
            const listedRelations: JSX.Element[] = [];

            for (const relation of relations) {
                const device = devices.find((device) => device.ieee_address === relation.source.ieeeAddr);

                if (device) {
                    listedRelations.push(
                        <li
                            key={relation.source.ieeeAddr}
                            title={`${t("zigbee:ieee_address")}: ${device.ieee_address} | ${t("zigbee:network_address")}: ${toHex(device.network_address, 4)} (${device.network_address})`}
                            className={highlighted(device.friendly_name)}
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
                } else {
                    listedRelations.push(
                        <li>
                            {t("zigbee:unknown")}: {relation.source.ieeeAddr}
                        </li>,
                    );
                }
            }

            return listedRelations;
        },
        [devices, t, highlighted],
    );

    const groupRelations = useCallback(
        (graph: Zigbee2MQTTNetworkMap, node: Zigbee2MQTTNetworkMap["nodes"][number]) => {
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
        },
        [listRelations, t],
    );

    const sortedNodes = useMemo(() => {
        const sortedNodes: JSX.Element[] = [];

        for (const node of graph.nodes) {
            const device = devices.find((device) => device.ieee_address === node.ieeeAddr);

            if (device) {
                if (!filterValue || node.friendlyName.toLowerCase().includes(filterValue.toLowerCase())) {
                    sortedNodes.push(
                        <ul className="menu bg-base-100 rounded-box shadow w-full" key={node.friendlyName}>
                            <li
                                title={`${t("zigbee:ieee_address")}: ${node.ieeeAddr} | ${t("zigbee:network_address")}: ${toHex(node.networkAddress, 4)} (${node.networkAddress})`}
                            >
                                {node.type === "Coordinator" ? (
                                    <Link to="/settings/about" className="link link-hover">
                                        <DeviceImage disabled={false} device={device} className="size-10" noIndicator={true} />
                                        {node.friendlyName}
                                    </Link>
                                ) : (
                                    <Link to={`/device/${node.ieeeAddr}`} className="link link-hover">
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
            } else {
                sortedNodes.push(
                    <li>
                        {t("zigbee:unknown")}: {node.ieeeAddr}
                    </li>,
                );
            }
        }

        sortedNodes.sort((a, b) => (a.key === "Coordinator" ? -1 : a.key!.localeCompare(b.key!)));

        return sortedNodes;
    }, [devices, filterValue, graph, groupRelations, t]);

    return isLoading ? (
        <>
            <div className="flex flex-row justify-center items-center gap-2">
                <span className="loading loading-infinity loading-xl" />
            </div>
            <div className="flex flex-row justify-center items-center gap-2">{t("loading")}</div>
        </>
    ) : (
        <>
            <div className="flex flex-row justify-center items-center gap-3">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                <label className="input w-64">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <DebouncedInput
                        className=""
                        type="search"
                        onChange={(value) => setFilterValue(value.toString())}
                        placeholder={t("common:search")}
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
                {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                <label className="input w-64">
                    <FontAwesomeIcon icon={faMarker} />
                    <DebouncedInput
                        className=""
                        type="search"
                        onChange={(value) => setHighlightValue(value.toString())}
                        placeholder={t("common:highlight")}
                        value={highlightValue}
                        disabled={graph.nodes.length === 0}
                    />
                    <kbd
                        className="kbd kbd-sm cursor-pointer"
                        onClick={() => setHighlightValue("")}
                        onKeyUp={(e) => {
                            if (e.key === "enter") {
                                setHighlightValue("");
                            }
                        }}
                        title={t("common:clear")}
                    >
                        x
                    </kbd>
                </label>
                <Button
                    className="btn btn-primary btn-square"
                    onClick={async () => {
                        dispatch(setNetworkGraphIsLoading());
                        await sendMessage("bridge/request/networkmap", { type: "raw", routes: false });
                    }}
                    title={graph.nodes.length > 0 ? t("refresh_data") : t("load")}
                >
                    {graph.nodes.length > 0 ? <FontAwesomeIcon icon={faSync} /> : <FontAwesomeIcon icon={faDownLong} />}
                </Button>
            </div>
            <div className="flex flex-row justify-center items-center gap-2 pt-3 pb-6 opacity-60">
                <FontAwesomeIcon icon={faQuestionCircle} />
                {t("lqi_help")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-3 px-6">{sortedNodes}</div>
        </>
    );
}
