import { faBroom, faCircleNotch, faExclamationTriangle, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import Table from "../components/table/Table.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { setTouchlinkIdentifyInProgress, setTouchlinkResetInProgress, setTouchlinkScan } from "../store.js";
import type { TouchlinkDevice } from "../types.js";

export default function TouchlinkPage() {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const dispatch = useAppDispatch();
    const touchlinkDevices = useAppSelector((state) => state.touchlinkDevices);
    const devices = useAppSelector((state) => state.devices);
    const touchlinkIdentifyInProgress = useAppSelector((state) => state.touchlinkIdentifyInProgress);
    const touchlinkResetInProgress = useAppSelector((state) => state.touchlinkResetInProgress);
    const touchlinkScanInProgress = useAppSelector((state) => state.touchlinkScanInProgress);
    const touchlinkInProgress = touchlinkIdentifyInProgress || touchlinkResetInProgress;
    const { t } = useTranslation("touchlink");

    const onScanClick = useCallback(async () => {
        dispatch(setTouchlinkScan({ inProgress: true, devices: [] }));
        await sendMessage("bridge/request/touchlink/scan", "");
    }, [sendMessage, dispatch]);

    const onIdentifyClick = useCallback(
        async (device: TouchlinkDevice): Promise<void> => {
            dispatch(setTouchlinkIdentifyInProgress(true));
            await sendMessage("bridge/request/touchlink/identify", device);
        },
        [sendMessage, dispatch],
    );

    const onResetClick = useCallback(
        async (device: TouchlinkDevice): Promise<void> => {
            dispatch(setTouchlinkResetInProgress(true));
            await sendMessage("bridge/request/touchlink/factory_reset", device);
        },
        [sendMessage, dispatch],
    );

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const columns = useMemo<ColumnDef<TouchlinkDevice, any>[]>(
        () => [
            {
                header: t("zigbee:ieee_address") as string,
                accessorFn: (touchlinkDevice) => touchlinkDevice.ieee_address,
                cell: ({ row: { original: touchlinkDevice } }) =>
                    devices.find((device) => device.ieee_address === touchlinkDevice.ieee_address) ? (
                        <Link to={`/device/${touchlinkDevice.ieee_address}`} className="link link-hover">
                            {touchlinkDevice.ieee_address}
                        </Link>
                    ) : (
                        touchlinkDevice.ieee_address
                    ),
            },
            {
                header: t("zigbee:friendly_name") as string,
                accessorFn: (touchlinkDevice) => devices.find((device) => device.ieee_address === touchlinkDevice.ieee_address)?.friendly_name,
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
                        <div className="join">
                            <Button<TouchlinkDevice>
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
                            <Button<TouchlinkDevice>
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
        [touchlinkIdentifyInProgress, touchlinkResetInProgress, touchlinkInProgress, devices, t, onIdentifyClick, onResetClick],
    );

    return (
        <div className="mt-2 px-2">
            <div className="hero bg-base-200 mb-3">
                <div className="hero-content text-center">
                    <div>
                        <h3 className="font-bold mb-2">{t("detected_devices_message", { count: touchlinkDevices.length })}</h3>
                        {touchlinkDevices.length > 0 && (
                            <Button title={t("rescan")} className="btn btn-primary btn-sm" onClick={onScanClick}>
                                <FontAwesomeIcon icon={faSync} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            {touchlinkScanInProgress ? (
                <div className="flex flex-row justify-center items-center mt-2 gap-2">
                    <span className="loading loading-infinity loading-xl" />
                </div>
            ) : touchlinkDevices.length > 0 ? (
                <Table id="touchlink-devices" columns={columns} data={touchlinkDevices} />
            ) : (
                <div className="flex flex-row flex-wrap justify-center items-center gap-2">
                    <Button className="btn btn-primary" onClick={onScanClick}>
                        {t("scan")}
                    </Button>
                </div>
            )}
        </div>
    );
}
