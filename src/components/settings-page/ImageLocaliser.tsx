import { type JSX, useContext, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import type { WithDevices } from "../../store.js";
import type { Device } from "../../types.js";
import Button from "../button/Button.js";
import { getZ2mDeviceImage } from "../device-image/index.js";

type LocaliserState = "none" | "start" | "inprogress" | "done";

type Props = WithDevices;

type LStatus = "init" | "error" | "done";

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(blob);
    });
}

async function downloadImage(imageSrc: string): Promise<string> {
    const image = await fetch(imageSrc);
    if (image.ok) {
        const blob = await image.blob();
        return blobToBase64(blob);
    }
    return Promise.reject(image.status);
}

async function asyncSome<X>(arr: Iterable<X>, predicate: (x: X) => Promise<boolean>): Promise<boolean> {
    for (const e of arr) {
        try {
            if (await predicate(e)) {
                return true;
            }
        } catch {
            /* empty */
        }
    }
    return false;
}

export function ImageLocaliser(props: Props): JSX.Element {
    const [currentState, setCurrentState] = useState<LocaliserState>("none");
    const { devices } = props;
    const [localisationStatus, setLocalisationStatus] = useState<Record<string, LStatus>>({});
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation("settings");

    async function localiseImage(device: Device) {
        setLocalisationStatus((curr) => {
            return { ...curr, [device.ieee_address]: "init" };
        });
        const success = await asyncSome([getZ2mDeviceImage], async (generator) => {
            const imageUrl = generator(device);
            const imageContent = await downloadImage(imageUrl);
            await DeviceApi.setDeviceOptions(sendMessage, device.ieee_address, { icon: imageContent });
            setLocalisationStatus((curr) => {
                return { ...curr, [device.ieee_address]: "done" };
            });
            return true;
        });
        if (!success) {
            throw new Error("Failed to localise image");
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: ???
    useEffect(() => {
        if (currentState === "start") {
            for (const device of Object.values<Device>(devices)) {
                if (device.type !== "Coordinator") {
                    localiseImage(device)
                        .catch((err) => {
                            console.log("Error localising image", err);
                            setLocalisationStatus((curr) => {
                                return { ...curr, [device.ieee_address]: "error" };
                            });
                        })
                        .then();
                }
            }
            setCurrentState("inprogress");
        }
    }, [currentState, devices]);

    switch (currentState) {
        case "none":
            return (
                <Button className="btn btn-primary join-item" onClick={() => setCurrentState("start")}>
                    {t("localise_images")}
                </Button>
            );
        case "inprogress":
            return (
                <ul className="menu menu-xs bg-base-200 max-w-xs w-full join-item">
                    {Object.values(devices).map((device) => {
                        return (
                            <li key={device.ieee_address} className="flex-row justify-between items-center border-b py-0.5">
                                {device.friendly_name}
                                <span className="badge badge-xs">{t(`common:${localisationStatus[device.ieee_address]}`)}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        case "done":
            return <div>{t("common:unknown")}</div>;
    }
    return <div>{t("zigbee:unknown")}</div>;
}
