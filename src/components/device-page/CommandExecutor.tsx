import { type JSX, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { LogMessage } from "../../store.js";
import type { Device } from "../../types.js";
import Button from "../button/Button.js";
import InputField from "../form-fields/InputField.js";
import TextareaField from "../form-fields/TextareaField.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import { LastLogResult } from "./LastLogResult.js";

interface CommandExecutorProps {
    lastLog?: LogMessage;
    device: Device;
}

export const CommandExecutor = (props: CommandExecutorProps): JSX.Element => {
    const { device, lastLog } = props;
    const { t } = useTranslation("zigbee");
    const [endpoint, setEndpoint] = useState<number>(1);
    const [cluster, setCluster] = useState<string>("");
    const [command, setCommand] = useState<string>("");
    const [payload, setPayload] = useState(JSON.stringify({}, null, 2));
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeDefinition = useAppSelector((state) => state.bridgeDefinition);

    const formIsValid = useMemo(() => {
        try {
            JSON.parse(payload);
        } catch {
            return false;
        }

        return !!cluster && !!command;
    }, [payload, cluster, command]);

    const clusters = useMemo(() => {
        const deviceEndpoint = device.endpoints[endpoint];
        const uniqueClusters = new Set<string>();

        if (deviceEndpoint) {
            for (const inCluster of deviceEndpoint.clusters.input) {
                uniqueClusters.add(inCluster);
            }

            for (const outCluster of deviceEndpoint.clusters.output) {
                uniqueClusters.add(outCluster);
            }
        }

        const customClusters = bridgeDefinition.custom_clusters[device.friendly_name];

        if (customClusters) {
            for (const key in bridgeDefinition.custom_clusters[device.friendly_name]) {
                uniqueClusters.add(key);
            }
        }

        for (const key in bridgeDefinition.clusters) {
            uniqueClusters.add(key);
        }

        return uniqueClusters;
    }, [device.friendly_name, device.endpoints, endpoint, bridgeDefinition]);

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg">{t("zigbee:execute_command")}</h2>
            <div className="flex flex-row flex-wrap gap-2">
                <InputField
                    type="number"
                    name="endpoint"
                    label={t("endpoint")}
                    min={1}
                    max={255}
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.valueAsNumber)}
                    required
                />
                <ClusterSinglePicker
                    data-testid="cluster-picker"
                    label={t("cluster")}
                    clusters={clusters}
                    value={cluster}
                    onChange={(cluster) => {
                        setCluster(cluster);
                    }}
                    required
                />
                <InputField
                    type="text"
                    name="command"
                    label={t("command")}
                    value={command}
                    placeholder={"state, color..."}
                    onChange={(e) => setCommand(e.target.value)}
                    pattern="^\d+|^\w+"
                    required
                />
            </div>
            <TextareaField
                name="payload"
                label={t("payload")}
                rows={3}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="textarea validator w-full"
                required
            />
            <Button
                onClick={async () =>
                    await DeviceApi.executeCommand(sendMessage, device.ieee_address, endpoint, cluster, command, JSON.parse(payload))
                }
                disabled={!formIsValid}
                className="btn btn-success"
            >
                {t("execute")}
            </Button>
            {lastLog && <LastLogResult message={lastLog} />}
        </div>
    );
};
