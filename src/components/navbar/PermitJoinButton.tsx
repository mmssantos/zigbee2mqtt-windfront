import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Device } from "../../types.js";
import Button from "../button/Button.js";
import { PopoverDropdown } from "../dropdown/PopoverDropdown.js";
import Countdown from "../value-decorators/Countdown.js";

export default function PermitJoinButton({ popoverId }: { popoverId: string }) {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["navbar"]);
    const [selectedRouter, setSelectedRouter] = useState<Device>();
    const devices = useAppSelector((state) => state.devices);
    const permitJoin = useAppSelector((state) => state.bridgeInfo.permit_join);
    const permitJoinEnd = useAppSelector((state) => state.bridgeInfo.permit_join_end);

    const routers = useMemo(() => {
        const filteredDevices: JSX.Element[] = [];

        for (const key in devices) {
            const device = devices[key];

            if (device.type === "Coordinator" || device.type === "Router") {
                filteredDevices.push(
                    <li key={device.friendly_name}>
                        <Button<Device> item={device} className="dropdown-item" onClick={(device) => setSelectedRouter(device)}>
                            {device.friendly_name}
                        </Button>
                    </li>,
                );
            }
        }

        filteredDevices.sort((a, b) => (a.key === "Coordinator" ? -1 : a.key!.localeCompare(b.key!)));

        return filteredDevices;
    }, [devices]);

    const permitJoinTimer = useMemo(
        () => (permitJoin ? <Countdown seconds={(permitJoinEnd! - Date.now()) / 1000} hideZeroes /> : null),
        [permitJoin, permitJoinEnd],
    );
    const buttonLabel = useMemo(
        () => (
            <>
                {permitJoin ? t("disable_join") : t("permit_join")} ({selectedRouter?.friendly_name ?? t("all")}){permitJoinTimer}
            </>
        ),
        [permitJoin, permitJoinTimer, selectedRouter, t],
    );

    return (
        <div className="join ml-2">
            <Button<void>
                onClick={async () =>
                    await sendMessage("bridge/request/permit_join", { time: permitJoin ? 0 : 254, device: selectedRouter?.ieee_address })
                }
                className="btn btn-outline-secondary join-item"
            >
                {buttonLabel}
            </Button>
            <PopoverDropdown
                name={`permit-join-${popoverId}`}
                buttonChildren={<FontAwesomeIcon icon={faAngleDown} title={t("toggle_dropdown")} />}
                buttonStyle="join-item"
                dropdownStyle="dropdown-end"
            >
                <li key="all">
                    <Button<Device> className="dropdown-item" onClick={() => setSelectedRouter(undefined)}>
                        {t("all")}
                    </Button>
                </li>
                {routers}
            </PopoverDropdown>
        </div>
    );
}
