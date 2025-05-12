import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTNetworkMap } from "zigbee2mqtt";
import type { Device } from "../../types.js";
import RawRelation from "./RawRelation.js";

type RawRelationGroupProps = {
    devices: Device[];
    relationship: string;
    relations: Zigbee2MQTTNetworkMap["links"];
    highlight: (friendlyName: string) => boolean;
    setHighlightValue: (friendlyName: string) => void;
};

const RawRelationGroup = memo(({ devices, relationship, relations, highlight, setHighlightValue }: RawRelationGroupProps) => {
    const { t } = useTranslation(["network", "common"]);

    return (
        <li>
            <details>
                <summary>
                    {t(relationship)} ({relations.length})
                </summary>
                <ul>
                    {relations.map((relation) => {
                        const device = devices.find((device) => device.ieee_address === relation.source.ieeeAddr);

                        return device ? (
                            <RawRelation
                                key={`${relation.source.ieeeAddr}-${relation.target.ieeeAddr}`}
                                relation={relation}
                                device={device}
                                highlight={highlight}
                                setHighlightValue={setHighlightValue}
                            />
                        ) : (
                            <li key={`${relation.source.ieeeAddr}-${relation.target.ieeeAddr}`}>
                                {t("zigbee:unknown")}: {relation.source.ieeeAddr}
                            </li>
                        );
                    })}
                </ul>
            </details>
        </li>
    );
});

export default RawRelationGroup;
