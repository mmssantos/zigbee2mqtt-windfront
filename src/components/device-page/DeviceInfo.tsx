import cx from "classnames";
import type { TFunction } from "i18next";
import capitalize from "lodash/capitalize.js";
import get from "lodash/get.js";
import lowerCase from "lodash/lowerCase.js";
import { Fragment, useContext } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { AvailabilityState } from "../../store.js";
import type { BridgeInfo, Device, DeviceState } from "../../types.js";
import { supportNewDevicesUrl, toHex } from "../../utils.js";
import { LastSeen } from "../LastSeen.js";
import { DeviceControlEditName } from "../device-control/DeviceControlEditName.js";
import DeviceControlGroup from "../device-control/DeviceControlGroup.js";
import { DeviceControlUpdateDesc } from "../device-control/DeviceControlUpdateDesc.js";
import { DeviceImage } from "../device-image/DeviceImage.js";
import { DisplayValue } from "../display-value/DisplayValue.js";
import ModelLink from "../links/ModelLink.js";
import VendorLink from "../links/VendorLink.js";
import PowerSource from "../power-source/PowerSource.js";
import { Availability } from "../zigbee/Availability.js";

type DeviceInfoProps = {
    device: Device;
};

// [Flower sensor](https://modkam.ru/?p=1700)
const markdownLinkRegex = /\[(.*?)]\((.*?)\)/;

export function DeviceInfo(props: DeviceInfoProps) {
    const { device } = props;
    const { t } = useTranslation("zigbee");
    const deviceStates = useAppSelector((state) => state.deviceStates);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const availability = useAppSelector((state) => state.availability);
    const homeassistantEnabled = !!bridgeInfo.config?.homeassistant?.enabled;
    const deviceState: DeviceState = deviceStates[device.friendly_name] ?? ({} as DeviceState);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const renameDevice = async (from: string, to: string, homeassistantRename: boolean): Promise<void> => {
        await DeviceApi.renameDevice(sendMessage, from, to, homeassistantRename);
    };
    const setDeviceDescription = async (old: string, newDesc: string): Promise<void> => {
        await DeviceApi.setDeviceDescription(sendMessage, old, newDesc);
    };
    const configureDevice = async (name: string): Promise<void> => {
        await DeviceApi.configureDevice(sendMessage, name);
    };
    const removeDevice = async (dev: string, force: boolean, block: boolean): Promise<void> => {
        await DeviceApi.removeDevice(sendMessage, dev, force, block);
    };
    const interviewDevice = async (name: string): Promise<void> => {
        await DeviceApi.interviewDevice(sendMessage, name);
    };

    const displayProps = [
        {
            translationKey: "friendly_name",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <strong>{device.friendly_name}</strong>
                    <DeviceControlEditName
                        device={device}
                        renameDevice={renameDevice}
                        homeassistantEnabled={homeassistantEnabled}
                        style="btn-link btn-sm btn-square"
                    />
                </dd>
            ),
        },
        {
            translationKey: "zigbee:description",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <pre style={{ display: "inline" }}>{device.description || ""}</pre>
                    <DeviceControlUpdateDesc device={device} setDeviceDescription={setDeviceDescription} />
                </dd>
            ),
        },
        {
            translationKey: "last_seen",
            render: (_device: Device, state: DeviceState, bridgeInfo: BridgeInfo) => (
                <dd className="col-12 col-md-7">
                    <LastSeen lastSeenType={bridgeInfo.config.advanced.last_seen} state={state} />
                </dd>
            ),
        },
        {
            translationKey: "availability:availability",
            render: (device: Device, _state: DeviceState, bridgeInfo: BridgeInfo, availability: AvailabilityState) => {
                const availabilityFeatureEnabled = !!bridgeInfo.config.availability?.enabled;
                const deviceAvailability = bridgeInfo.config.devices[device.ieee_address]?.availability;
                const availabilityEnabledForDevice = deviceAvailability != null ? !!deviceAvailability : undefined;

                return (
                    <dd className="col-12 col-md-7">
                        <Availability
                            availability={availability}
                            disabled={device.disabled}
                            availabilityFeatureEnabled={availabilityFeatureEnabled}
                            availabilityEnabledForDevice={availabilityEnabledForDevice}
                        />
                    </dd>
                );
            },
        },
        {
            key: "type",
            translationKey: "device_type",
        },
        {
            key: "model_id",
            translationKey: "zigbee_model",
        },
        {
            key: "manufacturer",
            translationKey: "zigbee_manufacturer",
        },
        {
            key: "definition.description",
            translationKey: "description",
            if: "supported",
            render: (device: Device) => {
                const result = markdownLinkRegex.exec(device.definition?.description as string);
                let content = <span>{device.definition?.description}</span>;
                if (result) {
                    const [, title, link] = result;
                    content = (
                        <a target="_blank" rel="noopener noreferrer" href={link} className="link link-hover">
                            {title}
                        </a>
                    );
                }
                return <dd className="col-12 col-md-7">{content}</dd>;
            },
        },
        {
            render: (device: Device, _state: DeviceState, _bridgeInfo: BridgeInfo, _availability: AvailabilityState, t: TFunction) => (
                <dd className="col-12 col-md-7">
                    <p
                        className={cx("mb-0", "font-weight-bold", {
                            "text-error": !device.supported,
                            "text-success": device.supported,
                        })}
                    >
                        <DisplayValue name="supported" value={device.supported} />
                        {!device.supported && (
                            <>
                                {" "}
                                <a target="_blank" rel="noopener noreferrer" href={supportNewDevicesUrl} className="link link-hover">
                                    ({t("how_to_add_support")})
                                </a>
                            </>
                        )}
                    </p>
                </dd>
            ),
            translationKey: "support_status",
        },
        {
            key: "ieee_address",
            translationKey: "ieee_address",
        },
        {
            key: "network_address",
            translationKey: "network_address",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <abbr title={t("network_address_hex")}>{toHex(device.network_address)}</abbr>
                    {" / "}
                    <abbr title={t("network_address_dec")}>{device.network_address}</abbr>
                </dd>
            ),
        },
        {
            key: "date_code",
            translationKey: "firmware_build_date",
            if: "date_code",
        },
        {
            key: "software_build_id",
            translationKey: "firmware_id",
            if: "software_build_id",
        },

        {
            key: "definition.vendor",
            translationKey: "manufacturer",
            if: "supported",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <VendorLink device={device} />
                </dd>
            ),
        },
        {
            key: "definition.model",
            translationKey: "model",
            if: "supported",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <ModelLink device={device} />
                </dd>
            ),
        },

        {
            translationKey: "power",
            render: (device: Device, deviceState: DeviceState) => (
                <dd className="col-12 col-md-7">
                    <PowerSource showLevel={true} device={device} deviceState={deviceState} />
                </dd>
            ),
        },
        {
            translationKey: "interview_state",
            render: (device: Device) => (
                <dd className="col-12 col-md-7">
                    <DisplayValue name="interview_state" value={capitalize(lowerCase(device.interview_state))} />
                </dd>
            ),
        },
    ];

    return (
        <Fragment>
            <div className="d-flex justify-content-center">
                <DeviceImage
                    // className={`card-img-top w-auto ${style['device-pic']}`}
                    device={device}
                    deviceState={deviceState}
                    disabled={device.disabled}
                />
            </div>
            <dl className="row">
                {displayProps
                    .filter((prop) => prop.if === undefined || get(device, prop.if, false))
                    .map((prop) => (
                        <Fragment key={prop.translationKey}>
                            <dt className="col-12 col-md-5">{t(prop.translationKey)}</dt>
                            {prop.render ? (
                                prop.render(device, deviceState, bridgeInfo, availability[device.friendly_name] ?? "offline", t)
                            ) : (
                                <dd className="col-12 col-md-7">{get(device, prop.key)}</dd>
                            )}
                        </Fragment>
                    ))}
            </dl>
            <DeviceControlGroup
                device={device}
                state={deviceState}
                homeassistantEnabled={homeassistantEnabled}
                configureDevice={configureDevice}
                renameDevice={renameDevice}
                removeDevice={removeDevice}
                interviewDevice={interviewDevice}
            />
        </Fragment>
    );
}
