import type { JSX } from "react";
import type { CompositeFeature, Endpoint, LastSeenType } from "../../types.js";
import type { BaseFeatureProps } from "../features/index.js";

import { Link } from "react-router";
import { getDeviceDetailsLink } from "../../utils.js";

import { useTranslation } from "react-i18next";
import { DeviceImage } from "../device-image/DeviceImage.js";
import { Composite } from "../features/Composite.js";
import { LastSeen } from "../value-decorators/LastSeen.js";
import { Lqi } from "../value-decorators/Lqi.js";
import PowerSource from "../value-decorators/PowerSource.js";

type Props = BaseFeatureProps<CompositeFeature> & {
    lastSeenType: LastSeenType;
    controls?: JSX.Element;
    endpoint?: Endpoint;
};

export default function DashboardDevice({
    onChange,
    onRead,
    device,
    endpoint,
    deviceState,
    lastSeenType,
    feature,
    featureWrapperClass,
    controls,
}: Props) {
    const { t } = useTranslation("zigbee");

    return (
        <>
            <li className="list-row flex-grow">
                <div>
                    {/* disabled always false because dashboard does not contain disabled devices */}
                    <DeviceImage disabled={false} device={device} deviceState={deviceState} className="size-10" />
                </div>
                <div>
                    <Link to={getDeviceDetailsLink(device.ieee_address)} className="link link-hover link-primary">
                        {device.friendly_name}
                        {endpoint ? ` (${t("endpoint")}: ${endpoint})` : ""}
                    </Link>
                    <div className="text-xs opacity-50">{device.description || ""}</div>
                </div>
                <div className="list-col-wrap text-sm w-full">
                    <Composite
                        feature={feature}
                        className="row"
                        type="composite"
                        device={device}
                        deviceState={deviceState}
                        onChange={onChange}
                        onRead={onRead}
                        featureWrapperClass={featureWrapperClass}
                        minimal={true}
                    />
                </div>
            </li>
            <li className="flex flex-row flex-wrap gap-1 m-4 justify-around items-center">
                <span className="badge badge-soft badge-ghost cursor-default" title={t("last_seen")}>
                    <LastSeen state={deviceState} lastSeenType={lastSeenType} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("lqi")}>
                    <Lqi value={deviceState.linkquality as number | undefined} />
                </span>
                <span className="badge badge-soft badge-ghost cursor-default" title={t("power")}>
                    <PowerSource device={device} deviceState={deviceState} />
                </span>
                {controls}
            </li>
        </>
    );
}
