import type { PropsWithChildren } from "react";
import type { Endpoint, FeatureWithAnySubFeatures, LastSeenConfig } from "../../types.js";
import type { BaseFeatureProps } from "../features/index.js";

import { Link } from "react-router";

import { faCircleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { FeatureSubFeatures } from "../features/FeatureSubFeatures.js";
import { LastSeen } from "../value-decorators/LastSeen.js";
import { Lqi } from "../value-decorators/Lqi.js";
import PowerSource from "../value-decorators/PowerSource.js";
import { DeviceImage } from "./DeviceImage.js";

type Props = BaseFeatureProps<FeatureWithAnySubFeatures> &
    PropsWithChildren<{
        lastSeenConfig: LastSeenConfig;
        endpoint?: Endpoint;
    }>;

export default function DeviceCard({
    onChange,
    onRead,
    device,
    endpoint,
    deviceState,
    lastSeenConfig,
    feature,
    featureWrapperClass,
    children,
}: Props) {
    const { t } = useTranslation(["zigbee", "devicePage"]);

    return (
        <>
            <li className="list-row flex-grow">
                <div>
                    {/* disabled always false because dashboard does not contain disabled devices */}
                    <DeviceImage disabled={false} device={device} deviceState={deviceState} className="size-10" />
                </div>
                <div>
                    <Link to={`/device/${device.ieee_address}`} className="link link-hover">
                        {device.friendly_name}
                        {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                    </Link>
                    <div className="text-xs opacity-50">{device.description || ""}</div>
                </div>
                <div className="list-col-wrap text-sm w-full">
                    <FeatureSubFeatures
                        feature={feature}
                        className="row"
                        device={device}
                        deviceState={deviceState}
                        onChange={onChange}
                        onRead={onRead}
                        featureWrapperClass={featureWrapperClass}
                        minimal={true}
                    />
                    <div className="flex flex-row items-center gap-1 mt-3">
                        <div className="flex-grow-1" />
                        <Link to={`/device/${device.ieee_address}/exposes`} className="link link-secondary" title={t("devicePage:exposes")}>
                            <FontAwesomeIcon icon={faCircleRight} size="xl" />
                        </Link>
                    </div>
                </div>
            </li>
            <li className="flex flex-row flex-wrap gap-1 m-4 justify-around items-center">
                <span className="badge badge-soft badge-ghost cursor-default" title={t("last_seen")}>
                    <LastSeen state={deviceState} config={lastSeenConfig} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("lqi")}>
                    <Lqi value={deviceState.linkquality as number | undefined} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("power")}>
                    <PowerSource device={device} deviceState={deviceState} />
                </span>
                {children}
            </li>
        </>
    );
}
