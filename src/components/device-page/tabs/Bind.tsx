import { type JSX, useMemo, useState } from "react";
import { useAppSelector } from "../../../hooks/useApp.js";
import type { Device } from "../../../types.js";
import { BindRow } from "../BindRow.js";

interface BindProps {
    device: Device;
}

export interface NiceBindingRule {
    id?: number;
    isNew?: true;
    source: {
        ieee_address: string;
        endpoint: string | number;
    };
    target:
        | {
              type: "group";
              id: number;
          }
        | {
              type: "endpoint";
              endpoint: string | number;
              ieee_address: string;
          };
    clusters: string[];
}
const rule2key = (rule: NiceBindingRule): string =>
    `${rule.source.endpoint}-${rule.isNew}${rule.source.ieee_address}-${"ieee_address" in rule.target ? rule.target.ieee_address : rule.target.id}-${rule.clusters.join("-")}`;

const convertBindingsIntoNiceStructure = (device: Device): NiceBindingRule[] => {
    const bindings: Record<string, NiceBindingRule> = {};

    for (const endpoint in device.endpoints) {
        const endpointDesc = device.endpoints[endpoint];

        for (const binding of endpointDesc.bindings) {
            let targetId = "ieee_address" in binding.target ? `${binding.target.ieee_address}-${binding.target.endpoint}` : binding.target.id;

            targetId = `${targetId}-${endpoint}`;

            if (bindings[targetId]) {
                bindings[targetId].clusters.push(binding.cluster);
            } else {
                bindings[targetId] = {
                    source: {
                        ieee_address: device.ieee_address,
                        endpoint,
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
    const bindingRules = useMemo(() => convertBindingsIntoNiceStructure(device), [device]);

    return (
        <div className="flex flex-col">
            {[...bindingRules, newBindingRule].map((rule) => (
                <BindRow key={rule2key(rule)} rule={rule} groups={groups} device={device} devices={devices} />
            ))}
        </div>
    );
}
