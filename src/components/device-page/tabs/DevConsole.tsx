import { useCallback, useContext, useEffect, useState } from "react";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device, LogMessage } from "../../../types.js";
import { AttributeEditor, type AttributeInfo } from "../AttributeEditor.js";
import { CommandExecutor } from "../CommandExecutor.js";
import ExternalDefinition from "../ExternalDefinition.js";

interface DevConsoleProps {
    device: Device;
}

const ATTRIBUTE_LOG_REGEX = /^(zhc:tz: Read result of |z2m: Publish 'set' 'read' to |z2m: Publish 'set' 'write' to |zhc:tz: Wrote )/;

export default function DevConsole(props: DevConsoleProps) {
    const lastLog = useAppSelector((state) => state.lastNonDebugLog);
    const [lastAttributeLog, setLastAttributeLog] = useState<LogMessage>();
    const [lastCommandLog, setLastCommandLog] = useState<LogMessage>();
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    useEffect(() => {
        if (lastLog) {
            if (lastLog.message.startsWith("zhc:tz: Invoked ")) {
                setLastCommandLog(lastLog);
            } else if (ATTRIBUTE_LOG_REGEX.test(lastLog.message)) {
                setLastAttributeLog(lastLog);
            }
        }
    }, [lastLog]);

    const readDeviceAttributes = useCallback(
        async (ieee: string, endpoint: string, cluster: string, attributes: string[], stateProperty?: string) => {
            const payload: { read: Record<string, unknown> } = { read: { cluster, attributes } };

            if (stateProperty) {
                payload.read.state_property = stateProperty;
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
        async (ieee: string, endpoint: string, cluster: string, attributes: AttributeInfo[]) => {
            const payload: { write: Record<string, unknown> & { payload: Record<string, unknown> } } = { write: { cluster, payload: {} } };

            for (const attrInfo of attributes) {
                payload.write.payload[attrInfo.attribute] = attrInfo.value;
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
