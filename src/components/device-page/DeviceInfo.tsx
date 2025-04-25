import capitalize from "lodash/capitalize.js";
import lowerCase from "lodash/lowerCase.js";
import { type JSX, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Device, DeviceState } from "../../types.js";
import { SUPPORT_NEW_DEVICES_URL, toHex } from "../../utils.js";
import { DeviceControlEditName } from "../device-control/DeviceControlEditName.js";
import DeviceControlGroup from "../device-control/DeviceControlGroup.js";
import { DeviceControlUpdateDesc } from "../device-control/DeviceControlUpdateDesc.js";
import { DeviceImage } from "../device-image/DeviceImage.js";
import { Availability } from "../value-decorators/Availability.js";
import { DisplayValue } from "../value-decorators/DisplayValue.js";
import { LastSeen } from "../value-decorators/LastSeen.js";
import ModelLink from "../value-decorators/ModelLink.js";
import PowerSource from "../value-decorators/PowerSource.js";
import VendorLink from "../value-decorators/VendorLink.js";

type DeviceInfoProps = {
    device: Device;
};

const MARKDOWN_LINK_REGEX = /\[(.*?)]\((.*?)\)/;

export function DeviceInfo(props: DeviceInfoProps) {
    const { device } = props;
    const { t } = useTranslation("zigbee");
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const availability = useAppSelector((state) => state.availability);
    const homeassistantEnabled = !!bridgeInfo.config?.homeassistant?.enabled;
    const deviceState: DeviceState = deviceStates[device.friendly_name] ?? ({} as DeviceState);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const renameDevice = useCallback(
        async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
            await DeviceApi.renameDevice(sendMessage, from, to, homeassistantRename);
        },
        [sendMessage],
    );
    const setDeviceDescription = useCallback(
        async (old: string, newDesc: string): Promise<void> => {
            await DeviceApi.setDeviceDescription(sendMessage, old, newDesc);
        },
        [sendMessage],
    );
    const configureDevice = useCallback(
        async (name: string): Promise<void> => {
            await DeviceApi.configureDevice(sendMessage, name);
        },
        [sendMessage],
    );
    const removeDevice = useCallback(
        async (dev: string, force: boolean, block: boolean): Promise<void> => {
            await DeviceApi.removeDevice(sendMessage, dev, force, block);
        },
        [sendMessage],
    );
    const interviewDevice = useCallback(
        async (name: string): Promise<void> => {
            await DeviceApi.interviewDevice(sendMessage, name);
        },
        [sendMessage],
    );

    const deviceAvailability = bridgeInfo.config.devices[device.ieee_address]?.availability;
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
                    <LastSeen lastSeenType={bridgeInfo.config.advanced.last_seen} state={deviceState} />
                </div>
                <div className="">
                    <Availability
                        availability={availability[device.friendly_name] ?? { state: "offline" }}
                        disabled={device.disabled}
                        availabilityFeatureEnabled={!!bridgeInfo.config.availability?.enabled}
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
