import { type JSX, useMemo, useState } from "react";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Device } from "../../types.js";
import { BindRow } from "./BindRow.js";

interface BindProps {
    device: Device;
}

export interface NiceBindingRule {
    id?: number;
    isNew?: true;
    source: {
        ieee_address: string;
        endpoint: string;
    };
    target:
        | {
              type: "group";
              id: number;
          }
        | {
              type: "endpoint";
              endpoint: string;
              ieee_address: string;
          };
    clusters: string[];
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
        isNew: true,
        target: { type: "endpoint", ieee_address: "", endpoint: "" },
        source: { ieee_address: device.ieee_address, endpoint: "" },
        clusters: [],
    });

    const bidingRules = useMemo(() => convertBindingsIntoNiceStructure(device), [device]);

    return (
        <div className="flex flex-col gap-2">
            {[...bidingRules, newBindingRule].map((rule, idx) => (
                <BindRow key={rule2key(rule)} rule={rule} groups={groups} device={device} idx={idx} devices={devices} />
            ))}
        </div>
    );
}
