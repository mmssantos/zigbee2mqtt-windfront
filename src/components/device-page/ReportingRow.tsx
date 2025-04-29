import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import type { Device, Endpoint } from "../../types.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import type { ClusterGroup } from "../pickers/index.js";

import { useTranslation } from "react-i18next";
import { getEndpoints } from "../../utils.js";
import Button from "../button/Button.js";
import InputField from "../form-fields/InputField.js";
import AttributePicker from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import type { NiceReportingRule } from "./tabs/Reporting.js";

interface ReportingRowProps {
    rule: NiceReportingRule;
    device: Device;
    onApply(rule: NiceReportingRule): void;
}
interface ReportingRowState {
    rule: NiceReportingRule;
}

const REQUIRED_RULE_FIELDS = ["maximum_report_interval", "minimum_report_interval", "reportable_change", "endpoint", "cluster", "attribute"];

const isValidRule = (rule: NiceReportingRule): boolean => {
    return REQUIRED_RULE_FIELDS.every((field) => rule[field] !== undefined && rule[field] !== "");
};

export function ReportingRow(props: ReportingRowProps) {
    const { rule, device, onApply } = props;
    const [state, setState] = useState<ReportingRowState>({ rule });
    const { t } = useTranslation(["zigbee", "common"]);

    const setSourceEp = useCallback(
        (sourceEp: Endpoint): void => {
            state.rule.endpoint = sourceEp;

            setState({ rule: state.rule });
        },
        [state],
    );

    const setCluster = useCallback(
        (cluster: string): void => {
            state.rule.cluster = cluster;

            setState({ rule: state.rule });
        },
        [state],
    );

    const setAttribute = useCallback(
        (attr: string): void => {
            state.rule.attribute = attr;

            setState({ rule: state.rule });
        },
        [state],
    );

    const changeHandlerNumber = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const { name, valueAsNumber } = event.target;
            state.rule[name] = valueAsNumber;

            setState({ rule: state.rule });
        },
        [state],
    );

    const disableRule = useCallback((): void => {
        onApply({ ...state.rule, maximum_report_interval: 0xffff });
    }, [state, onApply]);

    const sourceEndpoints = useMemo(() => getEndpoints(device), [device]);
    const clusters = useMemo((): ClusterGroup[] => {
        const possibleClusters = new Set<string>();
        const availableClusters = new Set<string>();

        if (state.rule.cluster) {
            availableClusters.add(state.rule.cluster);
        }

        const ep = device.endpoints[state.rule.endpoint];

        if (ep) {
            for (const outputCluster of ep.clusters.output) {
                availableClusters.add(outputCluster);
            }

            for (const inputCluster of ep.clusters.input) {
                if (!availableClusters.has(inputCluster)) {
                    possibleClusters.add(inputCluster);
                }
            }
        }

        return [
            {
                name: "available",
                clusters: availableClusters,
            },
            {
                name: "possible",
                clusters: possibleClusters,
            },
        ];
    }, [device.endpoints, state.rule.endpoint, state.rule.cluster]);

    return (
        <tr>
            <td>
                <EndpointPicker
                    label={t("endpoint")}
                    disabled={!rule.isNew}
                    values={sourceEndpoints}
                    value={state.rule.endpoint}
                    onChange={setSourceEp}
                    required
                />
            </td>
            <td>
                <ClusterSinglePicker
                    label={t("cluster")}
                    disabled={!state.rule.endpoint}
                    clusters={clusters}
                    value={state.rule.cluster}
                    onChange={setCluster}
                    required
                />
            </td>
            <td>
                <AttributePicker
                    label={t("attribute")}
                    disabled={!state.rule.cluster}
                    value={state.rule.attribute}
                    cluster={state.rule.cluster}
                    device={device}
                    onChange={setAttribute}
                    required
                />
            </td>
            <td>
                <InputField
                    name="minimum_report_interval"
                    label={t("min_rep_interval")}
                    type="number"
                    value={state.rule.minimum_report_interval}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <InputField
                    name="maximum_report_interval"
                    label={t("max_rep_interval")}
                    type="number"
                    value={state.rule.maximum_report_interval}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <InputField
                    name="reportable_change"
                    label={t("min_rep_change")}
                    type="number"
                    value={state.rule.reportable_change}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("actions")}</legend>
                    <div className="join">
                        <Button<NiceReportingRule>
                            className="btn btn-primary join-item"
                            item={state.rule}
                            onClick={onApply}
                            disabled={!isValidRule(state.rule)}
                        >
                            {t("common:apply")}
                        </Button>
                        {!state.rule.isNew ? (
                            <Button<void> prompt className="btn btn-error join-item" onClick={disableRule}>
                                {t("common:disable")}
                            </Button>
                        ) : null}
                    </div>
                </fieldset>
            </td>
        </tr>
    );
}
