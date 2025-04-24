import { type JSX, useContext, useMemo, useState } from "react";
import type { Attribute, Cluster, Device, Endpoint } from "../../types.js";

import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as ReportingApi from "../../actions/ReportingApi.js";
import { ReportingRow } from "./ReportingRow.js";

interface ReportingProps {
    device: Device;
}

export interface NiceReportingRule {
    id?: number;
    isNew?: number;
    endpoint: Endpoint;

    cluster: Cluster;
    attribute: Attribute;
    minimum_report_interval: number;
    maximum_report_interval: number;
    reportable_change: number;
}
const convertBindingsIntoNiceStructure = (device: Device): NiceReportingRule[] => {
    const niceReportingRules: NiceReportingRule[] = [];

    for (const key in device.endpoints) {
        const endpoint = device.endpoints[key];

        for (const cr of endpoint.configured_reportings) {
            niceReportingRules.push({
                ...cr,
                endpoint: key,
            });
        }
    }

    return niceReportingRules;
};

const rule2key = (rule: NiceReportingRule): string => `${rule.isNew}${rule.endpoint}${rule.cluster}-${rule.attribute}`;

export function Reporting(props: ReportingProps): JSX.Element {
    const { device } = props;
    const [newReportingRule] = useState<NiceReportingRule>({
        isNew: Date.now(),
        reportable_change: 0,
        minimum_report_interval: 60,
        maximum_report_interval: 3600,
        endpoint: "",
        cluster: "",
        attribute: "",
    });
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const onApply = async (rule: NiceReportingRule): Promise<void> => {
        const { cluster, endpoint, attribute, minimum_report_interval, maximum_report_interval, reportable_change } = rule;
        await ReportingApi.configureReport(sendMessage, device.friendly_name, endpoint, {
            cluster,
            attribute,
            minimum_report_interval,
            maximum_report_interval,
            reportable_change,
        });
    };
    const reportingRules = useMemo(() => convertBindingsIntoNiceStructure(device), [device]);
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {[...reportingRules, newReportingRule].map((rule) => (
                        <ReportingRow key={rule2key(rule)} rule={rule} device={device} onApply={onApply} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
