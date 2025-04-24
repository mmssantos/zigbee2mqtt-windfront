import orderBy from "lodash/orderBy.js";
import snakeCase from "lodash/snakeCase.js";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { WithDevices } from "../../store.js";

type StatsProps = WithDevices;

export function Stats(props: StatsProps): JSX.Element {
    const { devices } = props;
    const { t } = useTranslation(["stats", "zigbee"]);
    const allDevices = Object.values(devices).filter((d) => d.type !== "Coordinator");
    const totalDevices = allDevices.length;
    const stats = {
        byType: {},
        byPowerSource: {},
        byVendor: {},
        byModel: {},
    };

    for (const device of allDevices) {
        const modelId = device.model_id || t("zigbee:unknown");
        const manufacturer = device.manufacturer || t("zigbee:unknown");
        const powerSource = t(`zigbee:${snakeCase(device.power_source || "unknown")}`);

        stats.byModel[modelId] = (stats.byModel[modelId] || 0) + 1;
        stats.byVendor[manufacturer] = (stats.byVendor[manufacturer] || 0) + 1;
        stats.byType[t(device.type)] = (stats.byType[t(device.type)] || 0) + 1;
        stats.byPowerSource[powerSource] = (stats.byPowerSource[powerSource] || 0) + 1;
    }

    const statRows = Object.entries(stats).map(([key, values]) => {
        return (
            <li key={key}>
                <details>
                    <summary>{t(key)}</summary>
                    <ul>
                        {orderBy(Object.entries(values), [([, v]) => v], ["desc"]).map(([key, value]) => (
                            <li key={key}>
                                <Link to="#">
                                    {key}: {value as number}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </details>
            </li>
        );
    });

    return (
        <ul>
            <li>
                <Link to="#">
                    {t("total")} {totalDevices}
                </Link>
            </li>
            {statRows}
        </ul>
    );
}
