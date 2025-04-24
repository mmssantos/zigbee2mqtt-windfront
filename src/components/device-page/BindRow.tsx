import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as BindApi from "../../actions/BindApi.js";
import type { Devices, WithDevices } from "../../store.js";
import type { Cluster, Device, Endpoint, Group, ObjectType } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import Button from "../button/Button.js";
import ClusterPicker from "../cluster-picker/ClusterPicker.js";
import { PickerType } from "../cluster-picker/index.js";
import DevicePicker from "../device-picker/DevicePicker.js";
import EndpointPicker from "../endpoint-picker/EndpointPicker.js";
import type { NiceBindingRule } from "./Bind.js";

interface BindRowProps extends WithDevices {
    rule: NiceBindingRule;
    idx: number;
    groups: Group[];
    device: Device;
}

interface BindRowState {
    stateRule: NiceBindingRule;
}

const getTarget = (rule: NiceBindingRule, devices: Devices, groups: Group[]): Device | Group => {
    if (rule.target.type === "group") {
        return groups.find((g) => g.id === rule.target.id) as Group;
    }
    return devices[rule.target?.ieee_address as string];
};

type Action = "Bind" | "Unbind";

export function BindRow(props: BindRowProps) {
    const [state, setState] = useState<BindRowState>({ stateRule: props.rule });
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["common", "zigbee"]);

    const setSourceEp = (sourceEp: Endpoint): void => {
        const { stateRule } = state;
        stateRule.source.endpoint = sourceEp;
        setState({ stateRule });
    };
    const setDestination = (destination: Device | Group, type: ObjectType): void => {
        const { stateRule } = state;
        if (type === "device") {
            const endpoints = getEndpoints(destination);
            stateRule.target.ieee_address = (destination as Device).ieee_address;
            stateRule.target.type = "endpoint";
            stateRule.target.endpoint = endpoints[0];
            stateRule.target.id = undefined; // XXX: biome: changed from delete
        } else if (type === "group") {
            stateRule.target.id = (destination as Group).id;
            stateRule.target.type = "group";
            stateRule.target.ieee_address = undefined; // XXX: biome: changed from delete
        }
        stateRule.clusters = [];
        setState({ stateRule });
    };
    const setDestinationEp = (destinationEp: Endpoint): void => {
        const { stateRule } = state;
        stateRule.target.endpoint = destinationEp;
        stateRule.clusters = [];
        setState({ stateRule });
    };
    const setClusters = (clusters: Cluster[]): void => {
        const { stateRule } = state;
        stateRule.clusters = clusters;
        setState({ stateRule });
    };
    const getBidingParams = (): BindApi.BindParams => {
        const { device, groups, devices } = props;
        const { stateRule } = state;
        let to = "";
        let toEndpoint: Endpoint | undefined;

        if (stateRule.target.type === "group") {
            const targetGroup = groups.find((group) => group.id === stateRule.target.id) as Group;
            to = targetGroup.friendly_name;
        } else if (stateRule.target.type === "endpoint") {
            const targetDevice = devices[stateRule.target?.ieee_address as string];
            to = targetDevice.friendly_name;

            if (targetDevice.type !== "Coordinator") {
                toEndpoint = stateRule.target.endpoint;
            }
        }

        return {
            from: device.friendly_name,
            from_endpoint: stateRule.source.endpoint,
            to,
            to_endpoint: toEndpoint,
            clusters: stateRule.clusters,
        };
    };
    const onBindOrUnBindClick = async (action: Action): Promise<void> => {
        const params = getBidingParams();

        if (action === "Bind") {
            await BindApi.addBind(sendMessage, params);
        } else {
            await BindApi.removeBind(sendMessage, params);
        }
    };
    const isValidRule = (): boolean => {
        const { stateRule } = state;
        let valid = false;

        if (stateRule.target.type === "endpoint") {
            valid = !!(stateRule.source.endpoint && stateRule.target.ieee_address && stateRule.target.endpoint && stateRule.clusters.length > 0);
        } else if (stateRule.target.type === "group") {
            valid = !!(stateRule.source.endpoint && stateRule.target.id && stateRule.clusters.length > 0);
        }

        return valid;
    };

    const { devices, groups, device } = props;
    const { stateRule } = state;
    const sourceEndpoints = getEndpoints(device);
    const target = getTarget(stateRule, devices, groups);
    const destinationEndpoints = getEndpoints(target);

    const possibleClusters: Set<Cluster> = new Set(stateRule.clusters);
    const srcEndpoint = device.endpoints[stateRule.source.endpoint];
    const dstEndpoint =
        stateRule.target.type === "endpoint" && stateRule.target.endpoint ? (target as Device)?.endpoints[stateRule.target.endpoint] : undefined;
    const allClustersValid = stateRule.target.type === "group" || (target as Device)?.type === "Coordinator";
    if (srcEndpoint && (dstEndpoint || allClustersValid)) {
        for (const cluster of [...srcEndpoint.clusters.input, ...srcEndpoint.clusters.output]) {
            const supportedInputOutput = srcEndpoint.clusters.input.includes(cluster) && dstEndpoint?.clusters.output.includes(cluster);
            const supportedOutputInput = srcEndpoint.clusters.output.includes(cluster) && dstEndpoint?.clusters.input.includes(cluster);
            if (supportedInputOutput || supportedOutputInput || allClustersValid) {
                possibleClusters.add(cluster);
            }
        }
    }

    return (
        <div className="row pb-2 border-bottom">
            <div className="col-md-2">
                <EndpointPicker
                    label={t("source_endpoint")}
                    disabled={!stateRule.isNew}
                    values={sourceEndpoints}
                    value={stateRule.source.endpoint}
                    onChange={setSourceEp}
                />
            </div>
            <div className="col-md-2">
                <DevicePicker
                    label={t("destination")}
                    disabled={!stateRule.isNew}
                    value={(stateRule.target.ieee_address || stateRule.target.id) as string}
                    devices={devices}
                    groups={groups}
                    onChange={setDestination}
                />
            </div>
            <div className="col-md-2">
                {stateRule.target.type === "endpoint" ? (
                    <EndpointPicker
                        label={t("destination_endpoint")}
                        disabled={!stateRule.isNew}
                        values={destinationEndpoints}
                        value={stateRule.target.endpoint as Endpoint}
                        onChange={setDestinationEp}
                    />
                ) : null}
            </div>
            <div className="col-md-4">
                <ClusterPicker
                    label={t("clusters")}
                    pickerType={PickerType.MULTIPLE}
                    clusters={Array.from(possibleClusters)}
                    value={stateRule.clusters}
                    onChange={setClusters}
                />
            </div>
            <div className="col-md-2">
                <div className="form-group">
                    <span className="form-label">Actions</span>
                    <div className="form-control border-0">
                        <div className="join">
                            <Button<Action>
                                item={"Bind"}
                                disabled={!isValidRule()}
                                title={t("bind")}
                                className="btn btn-primary join-item"
                                onClick={onBindOrUnBindClick}
                            >
                                {t("bind")}&nbsp;
                                <FontAwesomeIcon icon={faLink} />
                            </Button>
                            <Button<Action>
                                item={"Unbind"}
                                disabled={!stateRule.isNew && !isValidRule()}
                                title={t("unbind")}
                                className="btn btn-error join-item"
                                onClick={onBindOrUnBindClick}
                            >
                                <FontAwesomeIcon icon={faUnlink} />
                                &nbsp;{t("unbind")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
