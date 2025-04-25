import { useCallback, useContext, useEffect, useState } from "react";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { LogMessage } from "../../store.js";
import type { Cluster, Device, Endpoint } from "../../types.js";
import { AttributeEditor, type AttributeInfo } from "./AttributeEditor.js";
import { CommandExecutor } from "./CommandExecutor.js";
import { ExternalDefinition } from "./ExternalDefinition.js";

interface DevConsoleProps {
    device: Device;
}

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

export function DevConsole(props: DevConsoleProps) {
    const logs = useAppSelector((state) => state.logs);
    const [lastAttributeLog, setLastAttributeLog] = useState<LogMessage>();
    const [lastCommandLog, setLastCommandLog] = useState<LogMessage>();

    useEffect(() => {
        const lastLog = logs[logs.length - 1];

        if (lastLog) {
            if (lastLog.message.startsWith("zhc:tz: Invoked ")) {
                setLastCommandLog(lastLog);
            } else if (ATTRIBUTE_LOG_REGEX.test(lastLog.message)) {
                setLastAttributeLog(lastLog);
            }
        }
    }, [logs]);

    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const readDeviceAttributes = useCallback(
        async (ieee: string, endpoint: Endpoint, cluster: Cluster, attributes: string[], options: Record<string, unknown>) =>
            await DeviceApi.readDeviceAttributes(sendMessage, ieee, endpoint, cluster, attributes, options),
        [sendMessage],
    );
    const writeDeviceAttributes = useCallback(
        async (ieee: string, endpoint: Endpoint, cluster: Cluster, attributes: AttributeInfo[], options: Record<string, unknown>) =>
            await DeviceApi.writeDeviceAttributes(sendMessage, ieee, endpoint, cluster, attributes, options),
        [sendMessage],
    );

    return (
        <div className="flex flex-col gap-3">
            <ExternalDefinition device={props.device} />
            <div className="divider" />
            <div className="grid grid-cols-1 lg:grid-cols-2 auto-rows-fr gap-3">
                <AttributeEditor
                    device={props.device}
                    lastLog={lastAttributeLog}
                    readDeviceAttributes={readDeviceAttributes}
                    writeDeviceAttributes={writeDeviceAttributes}
                />
                <CommandExecutor device={props.device} lastLog={lastCommandLog} />
            </div>
        </div>
    );
}
