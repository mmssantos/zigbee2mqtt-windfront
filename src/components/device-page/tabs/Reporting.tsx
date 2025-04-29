import { type JSX, useCallback, useContext, useMemo, useState } from "react";
import type { Device, Endpoint } from "../../../types.js";

import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { ReportingRow } from "../ReportingRow.js";

interface ReportingProps {
    device: Device;
}

export type NiceReportingRule = {
    isNew?: number;
    endpoint: Endpoint;
} & Device["endpoints"][number]["configured_reportings"][number];

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

const getRuleKey = (rule: NiceReportingRule): string => `${rule.isNew}-${rule.endpoint}-${rule.cluster}-${rule.attribute}`;

export function Reporting(props: ReportingProps): JSX.Element {
    const { device } = props;
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [newReportingRule] = useState<NiceReportingRule>({
        isNew: Date.now(),
        reportable_change: 0,
        minimum_report_interval: 60,
        maximum_report_interval: 3600,
        endpoint: "",
        cluster: "",
        attribute: "",
    });
    const reportingRules = useMemo(() => convertBindingsIntoNiceStructure(device), [device]);

    const onApply = useCallback(
        async (rule: NiceReportingRule): Promise<void> => {
            const { cluster, endpoint, attribute, minimum_report_interval, maximum_report_interval, reportable_change } = rule;

            await sendMessage("bridge/request/device/configure_reporting", {
                id: device.ieee_address,
                endpoint,
                cluster,
                attribute,
                minimum_report_interval,
                maximum_report_interval,
                reportable_change,
                option: {}, // TODO: check this
            });
        },
        [sendMessage, device.ieee_address],
    );

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {[...reportingRules, newReportingRule].map((rule) => (
                        <ReportingRow key={getRuleKey(rule)} rule={rule} device={device} onApply={onApply} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
