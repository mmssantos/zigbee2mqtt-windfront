import { type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getDeviceDetailsLink, lastSeen, toHex } from "../../utils.js";

import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { DEVICE_TABLE_PAGE_SIZE_KEY } from "../../localStoreConsts.js";
import type { AvailabilityState, Device, DeviceState, LastSeenConfig } from "../../types.js";
import DeviceControlGroup from "../device-control/DeviceControlGroup.js";
import { DeviceImage } from "../device-image/DeviceImage.js";
import Table from "../grid/Table.js";
import { Availability } from "../value-decorators/Availability.js";
import { LastSeen } from "../value-decorators/LastSeen.js";
import { Lqi } from "../value-decorators/Lqi.js";
import ModelLink from "../value-decorators/ModelLink.js";
import PowerSource from "../value-decorators/PowerSource.js";
import VendorLink from "../value-decorators/VendorLink.js";

export type DevicesTableProps = {
    devices: DeviceTableData[];
    lastSeenConfig: LastSeenConfig;
    availabilityFeatureEnabled: boolean;
    homeassistantEnabled: boolean;
    renameDevice(from: string, to: string, homeassistantRename: boolean): Promise<void>;
    configureDevice(name: string): Promise<void>;
    removeDevice(dev: string, force: boolean, block: boolean): Promise<void>;
    interviewDevice(name: string): Promise<void>;
};
export type DeviceTableData = {
    device: Device;
    state: DeviceState;
    availabilityState: AvailabilityState;
    availabilityEnabledForDevice: boolean | undefined;
};

export function DevicesTable(props: DevicesTableProps): JSX.Element {
    const {
        devices,
        lastSeenConfig,
        availabilityFeatureEnabled,
        homeassistantEnabled,
        renameDevice,
        removeDevice,
        configureDevice,
        interviewDevice,
    } = props;
    const { t } = useTranslation(["zigbee", "common", "availability"]);

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
                            <Link to={getDeviceDetailsLink(device.ieee_address)} className="link link-hover">
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
                accessorFn: ({ state }) => lastSeen(state, lastSeenConfig)?.getTime(),
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <LastSeen state={state} config={lastSeenConfig} />,
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
                            availabilityFeatureEnabled={availabilityFeatureEnabled}
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
                            homeassistantEnabled={homeassistantEnabled}
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
        [lastSeenConfig, availabilityFeatureEnabled, t, homeassistantEnabled, renameDevice, removeDevice, configureDevice, interviewDevice],
    );
    const visibleColumns = useMemo(
        () => ({
            friendly_name: true,
            ieee_address: true,
            model: true,
            last_seen: lastSeenConfig !== "disable",
            availability: availabilityFeatureEnabled || devices.some((device) => device.availabilityEnabledForDevice),
            controls: true,
        }),
        [lastSeenConfig, availabilityFeatureEnabled, devices],
    );

    return <Table id="all-devices" columns={columns} data={devices} pageSizeStoreKey={DEVICE_TABLE_PAGE_SIZE_KEY} visibleColumns={visibleColumns} />;
}
