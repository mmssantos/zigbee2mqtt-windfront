import { faBroom, faCircleNotch, faExclamationTriangle, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { type JSX, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import * as TouchlinkApi from "../actions/TouchlinkApi.js";
import Button from "../components/button/Button.js";
import { Table } from "../components/grid/Table.js";
import { useAppSelector } from "../hooks/store.js";
import type { TouchLinkDevice } from "../types.js";
import { genDeviceDetailsLink } from "../utils.js";

export default function TouchlinkPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const dispatch = useDispatch();
    const touchlinkDevices = useAppSelector((state) => state.touchlinkDevices);
    const devices = useAppSelector((state) => state.devices);
    const touchlinkIdentifyInProgress = useAppSelector((state) => state.touchlinkIdentifyInProgress);
    const touchlinkResetInProgress = useAppSelector((state) => state.touchlinkResetInProgress);
    const touchlinkScanInProgress = useAppSelector((state) => state.touchlinkScanInProgress);
    const touchlinkInProgress = touchlinkIdentifyInProgress || touchlinkResetInProgress;
    const { t } = useTranslation("touchlink");

    const onIdentifyClick = async (device: TouchLinkDevice): Promise<void> => {
        await TouchlinkApi.touchlinkIdentify(sendMessage, dispatch, device as unknown as Record<string, unknown>);
    };
    const onResetClick = async (device: TouchLinkDevice): Promise<void> => {
        await TouchlinkApi.touchlinkReset(sendMessage, dispatch, device as unknown as Record<string, unknown>);
    };
    const renderTouchlinkDevices = (): JSX.Element => {
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        const columns = useMemo<ColumnDef<TouchLinkDevice, any>[]>(
            () => [
                {
                    header: t("zigbee:ieee_address") as string,
                    accessorFn: (touchlinkDevice) => touchlinkDevice.ieee_address,
                    cell: ({ row: { original: touchlinkDevice } }) =>
                        devices[touchlinkDevice.ieee_address] ? (
                            <Link to={genDeviceDetailsLink(touchlinkDevice.ieee_address)} className="link link-hover">
                                {touchlinkDevice.ieee_address}
                            </Link>
                        ) : (
                            touchlinkDevice.ieee_address
                        ),
                },
                {
                    header: t("zigbee:friendly_name") as string,
                    accessorFn: (touchlinkDevice) => devices[touchlinkDevice.ieee_address]?.friendly_name,
                },
                {
                    id: "channel",
                    header: t("zigbee:channel") as string,
                    accessorFn: () => "channel",
                },

                {
                    id: "actions",
                    header: "",
                    cell: ({ row: { original: touchlinkDevice } }) => {
                        return (
                            <div className="join float-right">
                                <Button<TouchLinkDevice>
                                    disabled={touchlinkInProgress}
                                    item={touchlinkDevice}
                                    title={t("identify")}
                                    className="btn btn-primary join-item"
                                    onClick={onIdentifyClick}
                                >
                                    <FontAwesomeIcon
                                        icon={touchlinkIdentifyInProgress ? faCircleNotch : faExclamationTriangle}
                                        spin={touchlinkIdentifyInProgress}
                                    />
                                </Button>
                                <Button<TouchLinkDevice>
                                    disabled={touchlinkInProgress}
                                    item={touchlinkDevice}
                                    title={t("factory_reset")}
                                    className="btn btn-error join-item"
                                    onClick={onResetClick}
                                >
                                    <FontAwesomeIcon icon={touchlinkResetInProgress ? faCircleNotch : faBroom} spin={touchlinkResetInProgress} />
                                </Button>
                            </div>
                        );
                    },
                    enableSorting: false,
                    enableColumnFilter: false,
                },
            ],
            [],
        );
        return <Table id="touchlinkDevices" columns={columns} data={touchlinkDevices} />;
    };
    const renderNoDevices = (): JSX.Element => {
        return (
            <Button className="btn btn-primary mx-auto d-block" onClick={async () => await TouchlinkApi.touchlinkScan(sendMessage, dispatch)}>
                {t("scan")}
            </Button>
        );
    };

    return (
        <div className="card">
            <div className="card-header allign-middle">
                {t("detected_devices_message", { count: touchlinkDevices.length })}
                <Button
                    title={t("rescan")}
                    className="btn btn-primary btn-sm float-right"
                    onClick={async () => await TouchlinkApi.touchlinkScan(sendMessage, dispatch)}
                >
                    <FontAwesomeIcon icon={faSync} />
                </Button>
            </div>
            <div className="card-body">
                {touchlinkScanInProgress ? (
                    <div className="flex flex-row justify-center items-center mt-2 gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                ) : touchlinkDevices.length === 0 ? (
                    renderNoDevices()
                ) : (
                    renderTouchlinkDevices()
                )}
            </div>
        </div>
    );
}
