import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as BridgeApi from "../../actions/BridgeApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Device } from "../../types.js";
import { toHHMMSS } from "../../utils.js";
import Button from "../button/Button.js";
import { PopoverDropdown } from "../dropdown/PopoverDropdown.js";

export function StartStopJoinButton({ popoverId }: { popoverId: string }) {
    const { t } = useTranslation(["navbar"]);
    const [selectedRouter, setSelectedRouter] = useState<Device>({} as Device);
    const [permitJoinTimeout, setPermitJoinTimeout] = useState<number | undefined>(undefined);
    const devices = useAppSelector((state) => state.devices);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const selectAndHide = (device: Device) => {
        setSelectedRouter(device);
    };

    let coordinator: Device | undefined;
    const routers: Device[] = [];

    for (const key in devices) {
        const device = devices[key];

        if (device.type === "Coordinator") {
            coordinator = device;
        } else if (device.type === "Router") {
            routers.push(device);
        }
    }

    routers.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));

    if (coordinator) {
        routers.unshift(coordinator);
    }

    const onBtnClick = useCallback(async () => {
        await BridgeApi.permitJoin(sendMessage, bridgeInfo.permit_join ? 0 : 254, selectedRouter);
    }, [sendMessage, bridgeInfo.permit_join, selectedRouter]);

    const updatePermitJoinTimeout = () => {
        setPermitJoinTimeout(bridgeInfo.permit_join_end ? Math.round((bridgeInfo.permit_join_end - Date.now()) / 1000) : undefined);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: ???
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        updatePermitJoinTimeout();

        if (bridgeInfo.permit_join_end) {
            interval = setInterval(() => updatePermitJoinTimeout(), 1000);
        }

        return () => clearInterval(interval);
    }, [bridgeInfo.permit_join_end]);

    const permitJoinTimer = (
        <>
            {permitJoinTimeout ? (
                <div className="d-inline-block mx-1" style={{ width: "30px", maxWidth: "30px" }}>
                    {toHHMMSS(permitJoinTimeout)}
                </div>
            ) : null}
        </>
    );
    const buttonLabel = (
        <>
            {bridgeInfo.permit_join ? t("disable_join") : t("permit_join")} ({selectedRouter?.friendly_name ?? t("all")}){permitJoinTimer}
        </>
    );
    return (
        <div className="join ml-2">
            <Button onClick={onBtnClick} className="btn btn-outline-secondary join-item">
                {buttonLabel}
            </Button>
            <PopoverDropdown
                name={`permit-join-${popoverId}`}
                buttonChildren={<FontAwesomeIcon icon={faAngleDown} title={t("toggle_dropdown")} />}
                buttonStyle="join-item"
                dropdownStyle="dropdown-end"
            >
                <li key="all">
                    <Button className="dropdown-item" onClick={selectAndHide}>
                        {t("all")}
                    </Button>
                </li>
                {routers.map((router) => (
                    <li key={router.friendly_name}>
                        <Button<Device> item={router} className="dropdown-item" onClick={selectAndHide}>
                            {router.friendly_name}
                        </Button>
                    </li>
                ))}
            </PopoverDropdown>
        </div>
    );
}
