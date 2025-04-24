import { type JSX, useMemo, useState } from "react";
import { useAppSelector } from "../../hooks/store.js";
import type { Cluster, Device, Endpoint } from "../../types.js";
import { BindRow } from "./BindRow.js";

interface BindProps {
    device: Device;
}
type BindTarget = {
    id?: number;
    endpoint?: Endpoint;
    ieee_address?: string;
    type: "endpoint" | "group";
};
type BindSource = {
    ieee_address: string;
    endpoint: Endpoint;
};
export interface NiceBindingRule {
    id?: number;
    isNew?: number;
    source: BindSource;
    target: BindTarget;
    clusters: Cluster[];
}
const rule2key = (rule: NiceBindingRule): string =>
    `${rule.source.endpoint}-${rule.isNew}${rule.source.ieee_address}-${rule.target.id}-${rule.target.ieee_address}-${rule.clusters.join("-")}`;

const convertBindingsIntoNiceStructure = (device: Device): NiceBindingRule[] => {
    const bindings = {};

    for (const endpoint in device.endpoints) {
        const endpointDesc = device.endpoints[endpoint];

        for (const binding of endpointDesc.bindings) {
            let targetId = binding.target.id ?? `${binding.target.ieee_address}-${binding.target.endpoint}`;

            targetId = `${targetId}-${endpoint}`;

            if (bindings[targetId]) {
                bindings[targetId].clusters.push(binding.cluster);
            } else {
                bindings[targetId] = {
                    source: {
                        ieee_address: device.ieee_address,
                        key: endpoint,
                    },
                    target: binding.target,
                    clusters: [binding.cluster],
                };
            }
        }
    }

    return Object.values(bindings);
};

export function Bind(props: BindProps): JSX.Element {
    const { device } = props;
    const devices = useAppSelector((state) => state.devices);
    const groups = useAppSelector((state) => state.groups);
    const [newBindingRule] = useState<NiceBindingRule>({
        isNew: Date.now(),
        target: {} as BindTarget,
        source: { ieee_address: device.ieee_address, endpoint: "" },
        clusters: [],
    });

    const bidingRules = useMemo(() => convertBindingsIntoNiceStructure(device), [device]);
    return (
        <div className="container-fluid">
            {[...bidingRules, newBindingRule].map((rule, idx) => (
                <BindRow key={rule2key(rule)} rule={rule} groups={groups} device={device} idx={idx} devices={devices} />
            ))}
        </div>
    );
}
