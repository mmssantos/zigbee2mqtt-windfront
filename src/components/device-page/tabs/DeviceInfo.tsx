import capitalize from "lodash/capitalize.js";
import lowerCase from "lodash/lowerCase.js";
import { type JSX, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { SUPPORT_NEW_DEVICES_URL } from "../../../consts.js";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device, DeviceState } from "../../../types.js";
import { toHex } from "../../../utils.js";
import { DeviceControlEditName } from "../../device-control/DeviceControlEditName.js";
import DeviceControlGroup from "../../device-control/DeviceControlGroup.js";
import { DeviceControlUpdateDesc } from "../../device-control/DeviceControlUpdateDesc.js";
import { DeviceImage } from "../../device-image/DeviceImage.js";
import { Availability } from "../../value-decorators/Availability.js";
import { DisplayValue } from "../../value-decorators/DisplayValue.js";
import { LastSeen } from "../../value-decorators/LastSeen.js";
import ModelLink from "../../value-decorators/ModelLink.js";
import PowerSource from "../../value-decorators/PowerSource.js";
import VendorLink from "../../value-decorators/VendorLink.js";

type DeviceInfoProps = {
    device: Device;
};

const MARKDOWN_LINK_REGEX = /\[(.*?)]\((.*?)\)/;

export function DeviceInfo(props: DeviceInfoProps) {
    const { device } = props;
    const { t } = useTranslation("zigbee");
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeConfig = useAppSelector((state) => state.bridgeInfo.config);
    const availability = useAppSelector((state) => state.availability);
    const homeassistantEnabled = bridgeConfig.homeassistant.enabled;
    const deviceState: DeviceState = deviceStates[device.friendly_name] ?? ({} as DeviceState);
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
    const setDeviceDescription = useCallback(
        async (id: string, description: string): Promise<void> => {
            await sendMessage("bridge/request/device/options", { id, options: { description } });
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

    const deviceAvailability = bridgeConfig.devices[device.ieee_address]?.availability;
    const deviceDescription = useMemo(() => {
        const result = MARKDOWN_LINK_REGEX.exec(device.definition?.description as string);
        let content: JSX.Element;

        if (result) {
            const [, title, link] = result;

            content = (
                <Link target="_blank" rel="noopener noreferrer" to={link} className="link link-hover">
                    {title}
                </Link>
            );
        } else {
            content = <span>{device.definition?.description}</span>;
        }

        return <div className="">{content}</div>;
    }, [device.definition]);

    return (
        <>
            <div className="flex flex-col justify-content-center">
                <DeviceImage device={device} deviceState={deviceState} disabled={device.disabled} />
            </div>
            <div className="flex flex-col">
                <div className="">
                    <strong>{device.friendly_name}</strong>
                    <DeviceControlEditName
                        device={device}
                        renameDevice={renameDevice}
                        homeassistantEnabled={homeassistantEnabled}
                        style="btn-link btn-sm btn-square"
                    />
                </div>
                <div className="">
                    <pre style={{ display: "inline" }}>{device.description || ""}</pre>
                    <DeviceControlUpdateDesc device={device} setDeviceDescription={setDeviceDescription} />
                </div>
                <div className="">
                    <LastSeen config={bridgeConfig.advanced.last_seen} state={deviceState} />
                </div>
                <div className="">
                    <Availability
                        availability={availability[device.friendly_name] ?? { state: "offline" }}
                        disabled={device.disabled}
                        availabilityFeatureEnabled={bridgeConfig.availability.enabled}
                        availabilityEnabledForDevice={deviceAvailability != null ? !!deviceAvailability : undefined}
                    />
                </div>
                <div className="">{device.type}</div>
                <div className="">{device.model_id}</div>
                <div className="">{device.manufacturer}</div>
                <div className="">{deviceDescription}</div>
                <div className="">
                    <p className={`mb-0 font-bold${device.supported ? " text-success" : " text-error"}`}>
                        <DisplayValue name="supported" value={device.supported} />
                        {!device.supported && (
                            <>
                                {" "}
                                <Link target="_blank" rel="noopener noreferrer" to={SUPPORT_NEW_DEVICES_URL} className="link link-hover">
                                    ({t("how_to_add_support")})
                                </Link>
                            </>
                        )}
                    </p>
                </div>
                <div className="">
                    <abbr title={t("network_address_hex")}>{toHex(device.network_address)}</abbr>
                    {" / "}
                    <abbr title={t("network_address_dec")}>{device.network_address}</abbr>
                </div>
                <div className="">{device.ieee_address}</div>
                <div className="">{device.network_address}</div>
                <div className="">{device.date_code}</div>
                <div className="">{device.software_build_id}</div>
                <div className="">
                    <VendorLink device={device} />
                </div>
                <div className="">
                    <ModelLink device={device} />
                </div>
                <div className="">
                    <PowerSource showLevel={true} device={device} deviceState={deviceState} />
                </div>
                <div className="">
                    <DisplayValue name="interview_state" value={capitalize(lowerCase(device.interview_state))} />
                </div>
            </div>
            <DeviceControlGroup
                device={device}
                state={deviceState}
                homeassistantEnabled={homeassistantEnabled}
                configureDevice={configureDevice}
                renameDevice={renameDevice}
                removeDevice={removeDevice}
                interviewDevice={interviewDevice}
            />
        </>
    );
}
