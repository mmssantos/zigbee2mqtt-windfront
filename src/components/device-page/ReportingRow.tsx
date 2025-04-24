import merge from "lodash/merge.js";
import { type ChangeEvent, useEffect, useState } from "react";
import type { Attribute, Cluster, Device, Endpoint } from "../../types.js";

import ClusterPicker from "../cluster-picker/ClusterPicker.js";
import { type ClusterGroup, PickerType } from "../cluster-picker/index.js";
import EndpointPicker from "../endpoint-picker/EndpointPicker.js";

import { useTranslation } from "react-i18next";
import { getEndpoints } from "../../utils.js";
import AttributePicker from "../attribute-picker/AttributePicker.js";
import Button from "../button/Button.js";
import { InputField } from "../form-fields/InputField.js";
import type { NiceReportingRule } from "./Reporting.js";

interface ReportingRowProps {
    rule: NiceReportingRule;
    device: Device;
    onApply(rule: NiceReportingRule): void;
}
interface ReportingRowState {
    stateRule: NiceReportingRule;
}

const getClusters = (device: Device, endpoint: Endpoint, currentCluster: Cluster): ClusterGroup[] => {
    const possibleClusters = new Set<Cluster>();
    const availableClusters = new Set<Cluster>();

    if (currentCluster) {
        availableClusters.add(currentCluster);
    }

    const ep = device.endpoints[endpoint];

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
};

const requiredRuleFiled = ["maximum_report_interval", "minimum_report_interval", "reportable_change", "endpoint", "cluster", "attribute"];

const isValidRule = (rule: NiceReportingRule): boolean => {
    return requiredRuleFiled.every((field) => rule[field] !== undefined && rule[field] !== "");
};

export function ReportingRow(props: ReportingRowProps) {
    const [state, setState] = useState<ReportingRowState>({
        stateRule: {} as NiceReportingRule,
    });
    const { t } = useTranslation(["zigbee", "common"]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: loop
    useEffect(() => {
        setState({ stateRule: merge({}, props.rule, state.stateRule) });
    }, [props.rule]);

    const setSourceEp = (sourceEp: Endpoint): void => {
        const { stateRule } = state;
        stateRule.endpoint = sourceEp;
        setState({ stateRule });
    };
    const setCluster = (cluster: Cluster): void => {
        const { stateRule } = state;
        stateRule.cluster = cluster;
        setState({ stateRule });
    };

    const setAttribute = (attr: Attribute): void => {
        const { stateRule } = state;
        stateRule.attribute = attr;
        setState({ stateRule });
    };

    const changeHandlerNumber = (event: ChangeEvent<HTMLInputElement>): void => {
        const { stateRule } = state;
        const { name, valueAsNumber } = event.target;
        if (!Number.isNaN(valueAsNumber)) {
            stateRule[name] = valueAsNumber;
        }
        setState({ stateRule });
    };

    const applyRule = (): void => {
        const { onApply } = props;
        const { stateRule } = state;
        onApply(stateRule);
    };

    const disableRule = (): void => {
        const { onApply } = props;
        const { stateRule } = state;

        onApply({ ...stateRule, maximum_report_interval: 0xffff });
    };

    const { rule, device } = props;
    const { stateRule } = state;
    const sourceEndpoints = getEndpoints(device);

    return (
        <tr>
            <td>
                <EndpointPicker
                    label={t("endpoint")}
                    disabled={!rule.isNew}
                    values={sourceEndpoints}
                    value={stateRule.endpoint}
                    onChange={setSourceEp}
                />
            </td>
            <td>
                <ClusterPicker
                    label={t("cluster")}
                    disabled={!stateRule.endpoint}
                    pickerType={PickerType.SINGLE}
                    clusters={getClusters(device, stateRule.endpoint, stateRule.cluster)}
                    value={stateRule.cluster}
                    onChange={setCluster}
                />
            </td>
            <td>
                <AttributePicker
                    label={t("attribute")}
                    disabled={!stateRule.cluster}
                    value={stateRule.attribute}
                    cluster={stateRule.cluster}
                    device={device}
                    onChange={setAttribute}
                />
            </td>
            <td>
                <InputField
                    name="minimum_report_interval"
                    label={t("min_rep_interval")}
                    type="number"
                    defaultValue={stateRule.minimum_report_interval}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <InputField
                    name="maximum_report_interval"
                    label={t("max_rep_interval")}
                    type="number"
                    defaultValue={stateRule.maximum_report_interval}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <InputField
                    name="reportable_change"
                    label={t("min_rep_change")}
                    type="number"
                    defaultValue={stateRule.reportable_change}
                    onChange={changeHandlerNumber}
                    required
                />
            </td>
            <td>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">{t("actions")}</legend>
                    <div className="join">
                        <Button<void> disabled={!isValidRule(stateRule)} className="btn btn-primary join-item" onClick={applyRule}>
                            {t("common:apply")}
                        </Button>
                        {!stateRule.isNew ? (
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
