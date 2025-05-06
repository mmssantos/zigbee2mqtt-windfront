import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import DeviceControlGroup from "../components/device/DeviceControlGroup.js";
import { DeviceImage } from "../components/device/DeviceImage.js";
import Table from "../components/table/Table.js";
import { Availability } from "../components/value-decorators/Availability.js";
import { LastSeen } from "../components/value-decorators/LastSeen.js";
import { Lqi } from "../components/value-decorators/Lqi.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import PowerSource from "../components/value-decorators/PowerSource.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppSelector } from "../hooks/useApp.js";
import { DEVICE_TABLE_PAGE_SIZE_KEY } from "../localStoreConsts.js";
import type { AvailabilityState, Device, DeviceState } from "../types.js";
import { lastSeen, toHex } from "../utils.js";

type DeviceTableData = {
    device: Device;
    state: DeviceState;
    availabilityState: AvailabilityState;
    availabilityEnabledForDevice: boolean | undefined;
};

export default function DevicesPage(): JSX.Element {
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const availability = useAppSelector((state) => state.availability);
    const { t } = useTranslation(["zigbee", "common", "availability"]);

    const data = useMemo((): DeviceTableData[] => {
        const renderDevices: DeviceTableData[] = [];

        for (const device of devices) {
            if (device.type !== "Coordinator") {
                const state = deviceStates[device.friendly_name] ?? ({} as DeviceState);
                const deviceAvailability = bridgeConfig.devices[device.ieee_address]?.availability;

                renderDevices.push({
                    device,
                    state,
                    availabilityState: availability[device.friendly_name] ?? { state: "offline" },
                    availabilityEnabledForDevice: deviceAvailability != null ? !!deviceAvailability : undefined,
                });
            }
        }

        return renderDevices;
    }, [devices, deviceStates, bridgeConfig.devices, availability]);

    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/rename", {
                from,
                to,
                homeassistant_rename: homeassistantRename,
                last: undefined,
            });
        },
        [sendMessage],
    );
    const configureDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/configure", { id });
        },
        [sendMessage],
    );
    const removeDevice = useCallback(
        async (id: string, force: boolean, block: boolean): Promise<void> => {
            await sendMessage("bridge/request/device/remove", { id, force, block });
        },
        [sendMessage],
    );
    const interviewDevice = useCallback(
        async (id: string): Promise<void> => {
            await sendMessage("bridge/request/device/interview", { id });
        },
        [sendMessage],
    );

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const columns = useMemo<ColumnDef<DeviceTableData, any>[]>(
        () => [
            {
                id: "friendly_name",
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
                                <DeviceImage device={device} deviceState={state} disabled={device.disabled} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/device/${device.ieee_address}`} className="link link-hover">
                                {device.friendly_name}
                            </Link>
                            {device.description && <div className="text-xs opacity-50">{device.description}</div>}
                            <div className="flex flex-row gap-1 mt-2">
                                <span className="badge badge-soft badge-ghost cursor-default" title={t("power")}>
                                    <PowerSource device={device} deviceState={state} />
                                </span>
                                <span className="badge badge-soft badge-ghost cursor-default" title={t("lqi")}>
                                    <Lqi value={state.linkquality as number | undefined} />
                                </span>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: "ieee_address",
                header: t("ieee_address"),
                accessorFn: ({ device }) => [device.ieee_address, toHex(device.network_address, 4), device.network_address].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <div>{device.ieee_address}</div>
                        <div className="flex flex-row gap-1 mt-2">
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("network_address_hex")}>
                                {toHex(device.network_address, 4)}
                            </span>
                            <span className="badge badge-ghost badge-sm cursor-default" title={t("network_address_dec")}>
                                {device.network_address}
                            </span>
                        </div>
                    </>
                ),
            },
            {
                id: "model",
                header: t("model"),
                accessorFn: ({ device }) => [device.definition?.model, device.model_id, device.definition?.vendor, device.manufacturer].join(" "),
                cell: ({
                    row: {
                        original: { device },
                    },
                }) => (
                    <>
                        <ModelLink device={device} />
                        <div className="flex flex-row gap-1 mt-2">
                            <span className="badge badge-ghost" title={t("manufacturer")}>
                                <VendorLink device={device} />
                            </span>
                        </div>
                    </>
                ),
            },
            {
                id: "last_seen",
                header: t("last_seen"),
                accessorFn: ({ state }) => lastSeen(state, bridgeConfig.advanced.last_seen)?.getTime(),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <LastSeen state={state} config={bridgeConfig.advanced.last_seen} />,
                enableColumnFilter: false,
            },
            {
                id: "availability",
                header: t("availability:availability"),
                accessorFn: ({ availabilityState }) => availabilityState.state,
                cell: ({
                    row: {
                        original: { device, availabilityState, availabilityEnabledForDevice },
                    },
                }) => {
                    return (
                        <Availability
                            disabled={device.disabled}
                            availability={availabilityState}
                            availabilityEnabledForDevice={availabilityEnabledForDevice}
                            availabilityFeatureEnabled={bridgeConfig.availability.enabled}
                        />
                    );
                },
                enableColumnFilter: false,
            },
            {
                id: "controls",
                header: "",
                cell: ({
                    row: {
                        original: { device, state },
                    },
                }) => {
                    return (
                        <DeviceControlGroup
                            device={device}
                            state={state}
                            homeassistantEnabled={bridgeConfig.homeassistant.enabled}
                            renameDevice={renameDevice}
                            removeDevice={removeDevice}
                            configureDevice={configureDevice}
                            interviewDevice={interviewDevice}
                        />
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [
            bridgeConfig.advanced.last_seen,
            bridgeConfig.availability.enabled,
            bridgeConfig.homeassistant.enabled,
            renameDevice,
            removeDevice,
            configureDevice,
            interviewDevice,
            t,
        ],
    );
    const visibleColumns = useMemo(
        () => ({
            friendly_name: true,
            ieee_address: true,
            model: true,
            last_seen: bridgeConfig.advanced.last_seen !== "disable",
            availability: bridgeConfig.availability.enabled || data.some((device) => device.availabilityEnabledForDevice),
            controls: true,
        }),
        [bridgeConfig.advanced.last_seen, bridgeConfig.availability.enabled, data],
    );

    return <Table id="all-devices" columns={columns} data={data} pageSizeStoreKey={DEVICE_TABLE_PAGE_SIZE_KEY} visibleColumns={visibleColumns} />;
}
