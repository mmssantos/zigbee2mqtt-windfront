import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import type { RootState } from "../../store.js";
import type { Device, Group } from "../../types.js";
import { getEndpoints, isDevice } from "../../utils.js";
import Button from "../button/Button.js";
import ClusterMultiPicker from "../pickers/ClusterMultiPicker.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import type { NiceBindingRule } from "./tabs/Bind.js";

interface BindRowProps extends Pick<RootState, "devices"> {
    rule: NiceBindingRule;
    idx: number;
    groups: Group[];
    device: Device;
}

interface BindRowState {
    stateRule: NiceBindingRule;
}

const getTarget = (rule: NiceBindingRule, devices: RootState["devices"], groups: Group[]): Device | Group | undefined => {
    const { target } = rule;

    return target.type === "group" ? groups.find((g) => g.id === target.id) : devices.find((device) => device.ieee_address === target.ieee_address);
};

type Action = "Bind" | "Unbind";

export function BindRow(props: BindRowProps) {
    const { devices, groups, device, rule } = props;
    const [state, setState] = useState<BindRowState>({ stateRule: rule });
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["common", "zigbee"]);
    const { stateRule } = state;

    const setSourceEp = (sourceEp: string): void => {
        stateRule.source.endpoint = sourceEp;

        setState({ stateRule });
    };
    const setDestination = (destination?: Device | Group): void => {
        if (!destination) {
            return;
        }

        if (isDevice(destination)) {
            const endpoints = getEndpoints(destination);
            stateRule.target = { type: "endpoint", ieee_address: destination.ieee_address, endpoint: endpoints[0] };
        } else {
            stateRule.target = { type: "group", id: destination.id };
        }

        stateRule.clusters = [];

        setState({ stateRule });
    };
    const setDestinationEp = (destinationEp: string): void => {
        if (stateRule.target.type === "endpoint") {
            stateRule.target.endpoint = destinationEp;
            stateRule.clusters = [];

            setState({ stateRule });
        }
    };
    const setClusters = (clusters: string[]): void => {
        stateRule.clusters = clusters;

        setState({ stateRule });
    };
    const onBindOrUnBindClick = async (action: Action): Promise<void> => {
        let to = "";
        let toEndpoint: string | undefined;
        const { target } = stateRule;

        if (target.type === "group") {
            const targetGroup = groups.find((group) => group.id === target.id);

            if (targetGroup) {
                to = targetGroup.friendly_name;
            } else {
                console.log("Target group does not exist:", target.id);
                return;
            }
        } else if (target.type === "endpoint") {
            const targetDevice = devices.find((device) => device.ieee_address === target.ieee_address);

            if (targetDevice) {
                to = targetDevice.friendly_name;

                if (targetDevice.type !== "Coordinator") {
                    toEndpoint = target.endpoint;
                }
            } else {
                console.log("Target device does not exist:", target.ieee_address);
                return;
            }
        }

        const bindParams = {
            from: device.friendly_name,
            from_endpoint: stateRule.source.endpoint,
            to,
            to_endpoint: toEndpoint,
            clusters: stateRule.clusters,
        };

        if (action === "Bind") {
            await sendMessage("bridge/request/device/bind", bindParams);
        } else {
            await sendMessage("bridge/request/device/unbind", bindParams);
        }
    };
    const isValidRule = (): boolean => {
        let valid = false;

        if (stateRule.target.type === "endpoint") {
            valid = !!(stateRule.source.endpoint && stateRule.target.ieee_address && stateRule.target.endpoint && stateRule.clusters.length > 0);
        } else if (stateRule.target.type === "group") {
            valid = !!(stateRule.source.endpoint && stateRule.target.id && stateRule.clusters.length > 0);
        }

        return valid;
    };

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);
    const target = getTarget(stateRule, devices, groups);
    const destinationEndpoints = useMemo(() => getEndpoints(target), [target]);

    const possibleClusters: Set<string> = new Set(stateRule.clusters);
    const srcEndpoint = device.endpoints[stateRule.source.endpoint];
    const dstEndpoint =
        stateRule.target.type === "endpoint" && stateRule.target.endpoint
            ? (target as Device | undefined)?.endpoints[stateRule.target.endpoint]
            : undefined;
    const allClustersValid = stateRule.target.type === "group" || (target as Device | undefined)?.type === "Coordinator";

    if (srcEndpoint && (dstEndpoint || allClustersValid)) {
        for (const cluster of [...srcEndpoint.clusters.input, ...srcEndpoint.clusters.output]) {
            if (allClustersValid) {
                possibleClusters.add(cluster);
            } else {
                const supportedInputOutput = srcEndpoint.clusters.input.includes(cluster) && dstEndpoint?.clusters.output.includes(cluster);
                const supportedOutputInput = srcEndpoint.clusters.output.includes(cluster) && dstEndpoint?.clusters.input.includes(cluster);

                if (supportedInputOutput || supportedOutputInput || allClustersValid) {
                    possibleClusters.add(cluster);
                }
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
                    value={"ieee_address" in stateRule.target ? stateRule.target.ieee_address : stateRule.target.id}
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
                        value={stateRule.target.endpoint}
                        onChange={setDestinationEp}
                    />
                ) : null}
            </div>
            <div className="col-md-4">
                <ClusterMultiPicker label={t("clusters")} clusters={possibleClusters} value={stateRule.clusters} onChange={setClusters} />
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
