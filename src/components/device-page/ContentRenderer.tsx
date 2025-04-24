import type { JSX } from "react";
import { Navigate, useParams } from "react-router";
import { useAppSelector } from "../../hooks/store.js";
import { Bind } from "./Bind.js";
import Clusters from "./Clusters.js";
import { DevConsole } from "./DevConsole.js";
import { DeviceInfo } from "./DeviceInfo.js";
import { DeviceSettings } from "./DeviceSettings.js";
import { DeviceSpecificSettings } from "./DeviceSpecificSettings.js";
import { Exposes } from "./Exposes.js";
import { Reporting } from "./Reporting.js";
import { ScenePage } from "./ScenePage.js";
import type { DevicePageUrlParams } from "./index.js";
import { States } from "./states.js";

export function ContentRenderer(): JSX.Element {
    const devices = useAppSelector((state) => state.devices);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const logs = useAppSelector((state) => state.logs);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const params = useParams<DevicePageUrlParams>();
    const device = devices[params.dev!]; // TODO: always valid?

    switch (params.tab) {
        case "info":
            return <DeviceInfo device={device} />;
        case "bind":
            return <Bind device={device} />;
        case "state":
            return <States device={device} />;
        case "exposes":
            return <Exposes device={device} />;
        case "clusters":
            return <Clusters device={device} />;
        case "reporting":
            return <Reporting device={device} />;
        case "settings":
            return <DeviceSettings device={device} bridgeInfo={bridgeInfo} />;
        case "settings-specific":
            return <DeviceSpecificSettings device={device} bridgeInfo={bridgeInfo} />;
        case "dev-console":
            return <DevConsole device={device} logs={logs} />;
        case "scene": {
            const deviceState = deviceStates[device.friendly_name] ?? {};
            return <ScenePage device={device} deviceState={deviceState} />;
        }
        default:
            return <Navigate to={`/device/${params.dev}/info`} />;
    }
}
