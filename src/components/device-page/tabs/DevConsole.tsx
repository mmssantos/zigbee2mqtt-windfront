import { useCallback, useContext, useEffect, useState } from "react";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { Cluster, Device, Endpoint, LogMessage } from "../../../types.js";
import { AttributeEditor, type AttributeInfo } from "../AttributeEditor.js";
import { CommandExecutor } from "../CommandExecutor.js";
import { ExternalDefinition } from "../ExternalDefinition.js";

interface DevConsoleProps {
    device: Device;
}

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

export default function DevConsole(props: DevConsoleProps) {
    const logs = useAppSelector((state) => state.logs);
    const [lastAttributeLog, setLastAttributeLog] = useState<LogMessage>();
    const [lastCommandLog, setLastCommandLog] = useState<LogMessage>();
    const { sendMessage } = useContext(WebSocketApiRouterContext);

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

    const readDeviceAttributes = useCallback(
        async (ieee: string, endpoint: Endpoint, cluster: Cluster, attributes: string[], stateProperty?: string) => {
            const payload = { read: { cluster, attributes } };

            if (stateProperty) {
                (payload.read as Record<string, unknown>).state_property = stateProperty;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sendMessage],
    );

    const writeDeviceAttributes = useCallback(
        async (ieee: string, endpoint: Endpoint, cluster: Cluster, attributes: AttributeInfo[]) => {
            const payload = { write: { cluster, payload: {} } };

            for (const attrInfo of attributes) {
                (payload.write.payload as Record<string, unknown>)[attrInfo.attribute] = attrInfo.value;
            }

            await sendMessage<"{friendlyNameOrId}/{endpoint}/set">(
                // @ts-expect-error templated API endpoint
                `${ieee}/${endpoint}/set`,
                payload,
            );
        },
        [sendMessage],
    );

    return (
        <div className="flex flex-col gap-3">
            <ExternalDefinition device={props.device} />
            <div className="divider" />
            <div className="flex flex-row flex-wrap justify-evenly gap-4">
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
