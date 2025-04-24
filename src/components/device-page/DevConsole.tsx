import { useContext } from "react";
import type { Device } from "../../types.js";

import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import type { LogMessage } from "../../store.js";
import { AttributeEditor } from "./AttributeEditor.js";
import { CommandExecutor } from "./CommandExecutor.js";
import { ExternalDefinition } from "./ExternalDefinition.js";

interface DevConsoleProps {
    device: Device;
    logs: LogMessage[];
}

export function DevConsole(props: DevConsoleProps) {
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <ExternalDefinition device={props.device} />
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <AttributeEditor
                        device={props.device}
                        logs={props.logs}
                        readDeviceAttributes={async (identity, endpoint, cluster, attributes, options) =>
                            await DeviceApi.readDeviceAttributes(sendMessage, identity, endpoint, cluster, attributes, options)
                        }
                        writeDeviceAttributes={async (identity, endpoint, cluster, attributes, options) =>
                            await DeviceApi.writeDeviceAttributes(sendMessage, identity, endpoint, cluster, attributes, options)
                        }
                    />
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <CommandExecutor device={props.device} logs={props.logs} />
                </div>
            </div>
        </div>
    );
}
