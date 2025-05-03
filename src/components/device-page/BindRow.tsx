import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useMemo, useState } from "react";
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
    groups: Group[];
    device: Device;
}

interface BindRowState {
    rule: NiceBindingRule;
}

const getTarget = (rule: NiceBindingRule, devices: RootState["devices"], groups: Group[]): Device | Group | undefined => {
    const { target } = rule;

    return target.type === "group" ? groups.find((g) => g.id === target.id) : devices.find((device) => device.ieee_address === target.ieee_address);
};

const isValidRule = (rule: NiceBindingRule): boolean => {
    let valid = false;

    if (rule.target.type === "endpoint") {
        valid = !!(rule.source.endpoint && rule.target.ieee_address && rule.target.endpoint && rule.clusters.length > 0);
    } else if (rule.target.type === "group") {
        valid = !!(rule.source.endpoint && rule.target.id && rule.clusters.length > 0);
    }

    return valid;
};

type Action = "Bind" | "Unbind";

export function BindRow(props: BindRowProps) {
    const { devices, groups, device, rule } = props;
    const [state, setState] = useState<BindRowState>({ rule });
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["common", "zigbee"]);

    const setSourceEp = useCallback(
        (sourceEp: string | number): void => {
            state.rule.source.endpoint = sourceEp;

            setState({ rule: state.rule });
        },
        [state.rule],
    );

    const setDestination = useCallback(
        (destination?: Device | Group): void => {
            if (!destination) {
                return;
            }

            if (isDevice(destination)) {
                state.rule.target = { type: "endpoint", ieee_address: destination.ieee_address, endpoint: "" };
            } else {
                state.rule.target = { type: "group", id: destination.id };
            }

            state.rule.clusters = [];

            setState({ rule: state.rule });
        },
        [state.rule],
    );

    const setDestinationEp = useCallback(
        (destinationEp: string): void => {
            if (state.rule.target.type === "endpoint") {
                state.rule.target.endpoint = destinationEp;
                state.rule.clusters = [];

                setState({ rule: state.rule });
            }
        },
        [state.rule],
    );

    const setClusters = useCallback(
        (clusters: string[]): void => {
            state.rule.clusters = clusters;

            setState({ rule: state.rule });
        },
        [state.rule],
    );

    const onBindOrUnBindClick = useCallback(
        async (action: Action): Promise<void> => {
            let to = "";
            let toEndpoint: string | number | undefined;
            const { target } = state.rule;

            if (target.type === "group") {
                const targetGroup = groups.find((group) => group.id === target.id);

                if (targetGroup) {
                    to = targetGroup.friendly_name;
                } else {
                    console.error("Target group does not exist:", target.id);
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
                    console.error("Target device does not exist:", target.ieee_address);
                    return;
                }
            }

            const bindParams = {
                from: device.friendly_name,
                from_endpoint: state.rule.source.endpoint,
                to,
                to_endpoint: toEndpoint,
                clusters: state.rule.clusters,
            };

            if (action === "Bind") {
                await sendMessage("bridge/request/device/bind", bindParams);
            } else {
                await sendMessage("bridge/request/device/unbind", bindParams);
            }
        },
        [device, state.rule, sendMessage, devices, groups],
    );

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);
    const target = getTarget(state.rule, devices, groups);
    const destinationEndpoints = useMemo(() => getEndpoints(target), [target]);

    const possibleClusters = useMemo(() => {
        const clusters: Set<string> = new Set(state.rule.clusters);
        const srcEndpoint = device.endpoints[state.rule.source.endpoint];
        const dstEndpoint =
            state.rule.target.type === "endpoint" && state.rule.target.endpoint != null
                ? (target as Device | undefined)?.endpoints[state.rule.target.endpoint]
                : undefined;
        const allClustersValid = state.rule.target.type === "group" || (target as Device | undefined)?.type === "Coordinator";

        if (srcEndpoint && (dstEndpoint || allClustersValid)) {
            for (const cluster of [...srcEndpoint.clusters.input, ...srcEndpoint.clusters.output]) {
                if (allClustersValid) {
                    clusters.add(cluster);
                } else {
                    const supportedInputOutput = srcEndpoint.clusters.input.includes(cluster) && dstEndpoint?.clusters.output.includes(cluster);
                    const supportedOutputInput = srcEndpoint.clusters.output.includes(cluster) && dstEndpoint?.clusters.input.includes(cluster);

                    if (supportedInputOutput || supportedOutputInput || allClustersValid) {
                        clusters.add(cluster);
                    }
                }
            }
        }

        return clusters;
    }, [device.endpoints, state, target]);

    return (
        <>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    label={t("source_endpoint")}
                    disabled={!state.rule.isNew}
                    values={sourceEndpoints}
                    value={state.rule.source.endpoint}
                    onChange={setSourceEp}
                />
                <DevicePicker
                    label={t("destination")}
                    disabled={!state.rule.isNew}
                    value={"ieee_address" in state.rule.target ? state.rule.target.ieee_address : state.rule.target.id}
                    devices={devices}
                    groups={groups}
                    onChange={setDestination}
                />
                {state.rule.target.type === "endpoint" ? (
                    <EndpointPicker
                        label={t("destination_endpoint")}
                        disabled={!state.rule.isNew}
                        values={destinationEndpoints}
                        value={state.rule.target.endpoint}
                        onChange={setDestinationEp}
                    />
                ) : null}
                <div className="flex-grow w-128">
                    <ClusterMultiPicker label={t("clusters")} clusters={possibleClusters} value={state.rule.clusters} onChange={setClusters} />
                </div>
                <div className="join join-vertical lg:join-horizontal">
                    <Button<Action>
                        item={"Bind"}
                        disabled={!isValidRule(state.rule)}
                        title={t("bind")}
                        className="btn btn-primary join-item"
                        onClick={onBindOrUnBindClick}
                    >
                        <FontAwesomeIcon icon={faLink} />
                        {t("bind")}&nbsp;
                    </Button>
                    <Button<Action>
                        item={"Unbind"}
                        disabled={!state.rule.isNew && !isValidRule(state.rule)}
                        title={t("unbind")}
                        className="btn btn-error join-item"
                        onClick={onBindOrUnBindClick}
                    >
                        <FontAwesomeIcon icon={faUnlink} />
                        &nbsp;{t("unbind")}
                    </Button>
                </div>
            </div>
            <div className="divider" />
        </>
    );
}
