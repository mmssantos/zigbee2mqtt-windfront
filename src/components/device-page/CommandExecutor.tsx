import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import type { LogMessage } from "../../store.js";
import type { Device } from "../../types.js";
import Button from "../button/Button.js";
import { LastLogResult } from "./LastLogResult.js";

interface CommandExecutorProps {
    logs: LogMessage[];
    device: Device;
}
export const CommandExecutor = (props: CommandExecutorProps): JSX.Element => {
    const { device, logs } = props;
    const { t } = useTranslation("zigbee");
    const [endpoint, setEndpoint] = useState<number>(1);
    const [cluster, setCluster] = useState<string>("");
    const [command, setCommand] = useState<string>("");
    const [payload, setPayload] = useState(JSON.stringify({}, null, 2));
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const formIsValid = (): boolean => {
        let payloadIsValid = true;

        try {
            JSON.parse(payload);
        } catch {
            payloadIsValid = false;
        }

        return payloadIsValid && !Number.isNaN(Number.parseInt(cluster)) && !Number.isNaN(Number.parseInt(command));
    };
    const onExecuteClick = async () => {
        await DeviceApi.executeCommand(
            sendMessage,
            device.friendly_name,
            endpoint,
            Number.parseInt(cluster),
            Number.parseInt(command),
            JSON.parse(payload),
        );
    };
    const logsFilterFn = (l: LogMessage): boolean => {
        return l.message.startsWith("Invoked ");
    };
    return (
        <div>
            <div className="row mb-3">
                <div className="col-4 col-sm-3">
                    <div className="form-group">
                        <label className="form-label">
                            {t("endpoint")}
                            <input
                                type="number"
                                min="1"
                                max="255"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.valueAsNumber)}
                                className="form-control"
                            />
                        </label>
                    </div>
                </div>
                <div className="col-4 col-sm-3">
                    <div className="col-auto">
                        <label className="form-label">
                            {t("cluster")}
                            <input
                                type="text"
                                value={cluster}
                                placeholder={"example: 0x0001, 1, 123"}
                                onChange={(e) => setCluster(e.target.value)}
                                className="form-control"
                            />
                        </label>
                    </div>
                </div>
                <div className="col-4 col-sm-3">
                    <div className="col-auto">
                        <label className="form-label">
                            {t("command")}
                            <input
                                type="text"
                                value={command}
                                placeholder={"example: 0x0001, 1, 123"}
                                onChange={(e) => setCommand(e.target.value)}
                                className="form-control"
                            />
                        </label>
                    </div>
                </div>
            </div>
            <div className="row mb-3 ">
                <div className="col-9 col-sm-9">
                    <div className="col-auto">
                        <label className="form-label">
                            {t("payload")}
                            <textarea rows={3} defaultValue={payload} onChange={(e) => setPayload(e.target.value)} className="form-control" />
                        </label>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="join col col-3">
                    <Button onClick={onExecuteClick} disabled={!formIsValid()} className="btn btn-success join-item">
                        {t("execute")}
                    </Button>
                </div>
            </div>
            <div className="row">
                <LastLogResult logs={logs} filterFn={logsFilterFn} />
            </div>
        </div>
    );
};
