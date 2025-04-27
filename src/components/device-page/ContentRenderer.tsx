import type { JSX } from "react";
import { Navigate, useParams } from "react-router";
import { useAppSelector } from "../../hooks/useApp.js";
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
    const params = useParams<DevicePageUrlParams>();
    const device = useAppSelector((state) => state.devices[params.dev!]);

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
            return <DeviceSettings device={device} />;
        case "settings-specific":
            return <DeviceSpecificSettings device={device} />;
        case "dev-console":
            return <DevConsole device={device} />;
        case "scene":
            return <ScenePage device={device} />;
        default:
            return <Navigate to={`/device/${params.dev}/info`} />;
    }
}
