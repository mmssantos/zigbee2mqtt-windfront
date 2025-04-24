import { useTranslation } from "react-i18next";
import type { Cluster, Device } from "../../types.js";

interface ClustersProps {
    device: Device;
}
type ClustersCompProps = {
    label: string;
    clusters: Cluster[];
};

const ClustersComp = (props: ClustersCompProps) => {
    const { label, clusters } = props;

    if (clusters.length) {
        return (
            <li>
                <span>{label}</span>
                <ul>
                    {clusters.map((cluster) => (
                        <li key={cluster}>
                            <span>{cluster}</span>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }
    return null;
};

export default function Clusters(props: ClustersProps) {
    const { t } = useTranslation("zigbee");
    const { device } = props;

    return (
        <dl /*className={`${treeStyle.tree} row`}*/>
            <ul>
                <li>
                    <span>{device.ieee_address}</span>
                    <ul>
                        {Object.entries(device.endpoints).map(([epName, epData]) => {
                            return (
                                <li key={epName}>
                                    <span>
                                        {t("endpoint")} <strong>{epName}</strong>
                                    </span>
                                    <ul>
                                        <ClustersComp label={t("output_clusters")} clusters={epData.clusters.output} />
                                        <ClustersComp label={t("input_clusters")} clusters={epData.clusters.input} />
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            </ul>
        </dl>
    );
}
