import { faClock, faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as OtaApi from "../actions/OtaApi.js";
import Button from "../components/button/Button.js";
import { DeviceImage } from "../components/device-image/DeviceImage.js";
import { Table } from "../components/grid/Table.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppSelector } from "../hooks/store.js";
import type { ApiSendMessage } from "../hooks/useApiWebSocket.js";
import { OTA_TABLE_PAGE_SIZE_KEY } from "../localStoreConsts.js";
import type { Device, DeviceState } from "../types.js";
import { getDeviceDetailsLink, toHHMMSS } from "../utils.js";

type OtaRowProps = {
    device: Device;
    state: DeviceState;
    sendMessage: ApiSendMessage;
};

function StateCell(props: OtaRowProps) {
    const { t } = useTranslation("ota");
    const { device, state, sendMessage } = props;
    const otaState = state?.update;

    if (otaState == null) {
        return <>HANDLED STATE</>;
    }

    switch (otaState.state) {
        case "updating":
            return (
                <>
                    <progress className="progress w-48" value={otaState.progress} max="100" />
                    <div>{t("remaining_time", { remaining: toHHMMSS(otaState.remaining ?? 0) })}</div>
                </>
            );
        case "available":
            return (
                <div className="join">
                    <Button<string>
                        className="btn btn-error btn-sm join-item"
                        onClick={async (deviceName) => await OtaApi.updateOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                        prompt
                    >
                        {t("update")}
                    </Button>
                    <Button<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={async (deviceName) => await OtaApi.scheduleOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                        title={t("schedule")}
                        prompt
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Button>
                </div>
            );
        case "scheduled":
            return (
                <div className="join">
                    <Button<string>
                        className="btn btn-primary btn-sm join-item"
                        onClick={async (deviceName) => await OtaApi.checkOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                    >
                        {t("check")}
                    </Button>
                    <Button<string>
                        className="btn btn-sm btn-error join-item"
                        onClick={async (deviceName) => await OtaApi.unscheduleOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                        title={t("scheduled")}
                        prompt
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Button>
                </div>
            );
        default:
            return (
                <div className="join">
                    <Button<string>
                        className="btn btn-primary btn-sm join-item"
                        onClick={async (deviceName) => await OtaApi.checkOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                    >
                        {t("check")}
                    </Button>
                    <Button<string>
                        className="btn btn-info btn-sm join-item"
                        onClick={async (deviceName) => await OtaApi.scheduleOTA(sendMessage, deviceName)}
                        item={device.friendly_name}
                        title={t("schedule")}
                        prompt
                    >
                        <FontAwesomeIcon icon={faClock} />
                    </Button>
                </div>
            );
    }
}

type OtaGridData = {
    id: string;
    device: Device;
    state: DeviceState;
};
export default function OtaPage() {
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const getAllOtaDevices = () => {
        const otaDevices: OtaGridData[] = [];

        for (const key in devices) {
            const device = devices[key];

            if (device?.definition?.supports_ota && !device.disabled) {
                const state = deviceStates[device.friendly_name] ?? ({} as DeviceState);

                otaDevices.push({ id: device.friendly_name, device, state });
            }
        }

        return otaDevices;
    };

    const checkAllOTA = async () => {
        const otaDevices = getAllOtaDevices();

        for (const otaDevice of otaDevices) {
            await OtaApi.checkOTA(sendMessage, otaDevice.device.friendly_name);
        }
    };
    const { t } = useTranslation("zigbee");
    const otaDevices = getAllOtaDevices();

    const renderOtaFileVersion = (version?: number) => {
        if (version === undefined) {
            return <>Unknown</>;
        }

        const versionString = version.toString(16).padStart(8, "0");
        const appRelease = `${versionString[0]}.${versionString[1]}`;
        const appBuild = versionString.slice(2, 4);
        const stackRelease = `${versionString[4]}.${versionString[5]}`;
        const stackBuild = versionString.slice(6);

        return (
            <div className="join join-vertical">
                <span className="badge badge-soft badge-ghost cursor-default join-item w-full">
                    {t("ota:app")}: {`${appRelease} build ${appBuild}`}
                </span>
                <span className="badge badge-soft badge-ghost cursor-default join-item w-full">
                    {t("ota:stack")}: {`${stackRelease} build ${stackBuild}`}
                </span>
            </div>
        );
    };

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    // biome-ignore lint/correctness/useExhaustiveDependencies: ???
    const columns = useMemo<ColumnDef<OtaGridData, any>[]>(
        () => [
            {
                header: t("friendly_name"),
                accessorFn: ({ device }) => [device.friendly_name, device.description].join(" "),
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => (
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="h-12 w-12" style={{ overflow: "visible" }}>
                                <DeviceImage device={device} deviceState={state} disabled={false} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={getDeviceDetailsLink(device.ieee_address)} className="link link-hover">
                                {device.friendly_name}
                            </Link>
                            {device.description && <div className="text-xs opacity-50">{device.description}</div>}
                            <span className="badge badge-soft badge-ghost cursor-default my-1" title={t("firmware_id")}>
                                {/** TODO: use releaseNotes from manifest instead of links (need API change in Z2M) */}
                                <FontAwesomeIcon icon={faMicrochip} />
                                <OtaLink device={device} />
                                {device.date_code ? <span title={t("firmware_build_date")}> ({device.date_code})</span> : undefined}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                header: t("model"),
                accessorFn: ({ device }) => [device.definition?.model, device.model_id, device.definition?.vendor, device.manufacturer].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <ModelLink device={device} />
                        <div>
                            <br />
                            <span className="badge badge-ghost" title={t("manufacturer")}>
                                <VendorLink device={device} />
                            </span>
                        </div>
                    </>
                ),
            },
            {
                header: t("ota:firmware_version"),
                // biome-ignore lint/suspicious/noExplicitAny: tmp
                accessorFn: ({ state }) => (state.update as any)?.installed_version as number,
                cell: ({
                    row: {
                        original: { state },
                    },
                    // biome-ignore lint/suspicious/noExplicitAny: tmp
                }) => renderOtaFileVersion((state.update as any)?.installed_version as number),
                enableColumnFilter: false,
            },
            {
                header: t("ota:available_firmware_version"),
                // biome-ignore lint/suspicious/noExplicitAny: tmp
                accessorFn: ({ state }) => (state.update as any)?.latest_version as number,
                cell: ({
                    row: {
                        original: { state },
                    },
                    // biome-ignore lint/suspicious/noExplicitAny: tmp
                }) => renderOtaFileVersion((state.update as any)?.latest_version as number),
                enableColumnFilter: false,
            },
            {
                header: () => (
                    <Button className="btn btn-error btn-sm" onClick={checkAllOTA} prompt>
                        {t("ota:check_all")}
                    </Button>
                ),
                accessorFn: ({ state }) => state?.update?.state,
                id: "check_all",
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => <StateCell device={device} state={state} sendMessage={sendMessage} />,
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [sendMessage],
    );

    return <Table id="otaDevices" columns={columns} data={otaDevices} pageSizeStoreKey={OTA_TABLE_PAGE_SIZE_KEY} />;
}
