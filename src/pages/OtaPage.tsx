import { faMicrochip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as OtaApi from "../actions/OtaApi.js";
import Button from "../components/button/Button.js";
import { DeviceImage } from "../components/device-image/DeviceImage.js";
import Table from "../components/grid/Table.js";
import OtaControlGroup from "../components/ota-page/OtaControlGroup.js";
import OtaFileVersion from "../components/ota-page/OtaFileVersion.js";
import ModelLink from "../components/value-decorators/ModelLink.js";
import OtaLink from "../components/value-decorators/OtaLink.js";
import VendorLink from "../components/value-decorators/VendorLink.js";
import { useAppSelector } from "../hooks/store.js";
import { OTA_TABLE_PAGE_SIZE_KEY } from "../localStoreConsts.js";
import type { Device, DeviceState } from "../types.js";
import { getDeviceDetailsLink } from "../utils.js";

type OtaGridData = {
    id: string;
    device: Device;
    state: DeviceState;
};

export default function OtaPage() {
    const devices = useAppSelector((state) => state.devices);
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("zigbee");

    const allOtaDevices = useMemo(() => {
        const otaDevices: OtaGridData[] = [];

        for (const key in devices) {
            const device = devices[key];

            if (device?.definition?.supports_ota && !device.disabled) {
                const state = deviceStates[device.friendly_name] ?? ({} as DeviceState);

                otaDevices.push({ id: device.friendly_name, device, state });
            }
        }

        return otaDevices;
    }, [deviceStates, devices]);

    const checkAllOTA = useCallback(async () => {
        for (const otaDevice of allOtaDevices) {
            await OtaApi.checkOTA(sendMessage, otaDevice.device.friendly_name);
        }
    }, [sendMessage, allOtaDevices]);

    // biome-ignore lint/suspicious/noExplicitAny: tmp
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
                accessorFn: ({ state }) => state.update?.installed_version,
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state.update?.installed_version} />,
                enableColumnFilter: false,
            },
            {
                header: t("ota:available_firmware_version"),
                accessorFn: ({ state }) => state.update?.latest_version,
                cell: ({
                    row: {
                        original: { state },
                    },
                }) => <OtaFileVersion version={state.update?.latest_version} />,
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
                }) => <OtaControlGroup device={device} state={state} sendMessage={sendMessage} />,
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [sendMessage, checkAllOTA, t],
    );

    return <Table id="otaDevices" columns={columns} data={allOtaDevices} pageSizeStoreKey={OTA_TABLE_PAGE_SIZE_KEY} />;
}
