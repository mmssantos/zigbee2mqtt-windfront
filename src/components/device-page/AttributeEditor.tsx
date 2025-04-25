import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataType } from "../../ZCLenums.js";
import type { LogMessage } from "../../store.js";
import type { Cluster, Device, Endpoint } from "../../types.js";
import { getEndpoints, getObjectFirstKey } from "../../utils.js";
import Button from "../button/Button.js";
import AttributePicker, { type AttributeDefinition } from "../pickers/AttributePicker.js";
import ClusterSinglePicker from "../pickers/ClusterSinglePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";
import { LastLogResult } from "./LastLogResult.js";

export interface AttributeEditorProps {
    device: Device;
    lastLog?: LogMessage;
    readDeviceAttributes(id: string, endpoint: Endpoint, cluster: Cluster, attributes: string[], options: Record<string, unknown>): Promise<void>;
    writeDeviceAttributes(
        id: string,
        endpoint: Endpoint,
        cluster: Cluster,
        attributes: AttributeInfo[],
        options: Record<string, unknown>,
    ): Promise<void>;
}
export type AttributeInfo = {
    attribute: string;
    definition: AttributeDefinition;
    value?: unknown;
};

export type AttributeValueInputProps = {
    onChange(attribute: string, value: unknown): void;
    attribute: string;
    definition: AttributeDefinition;
    value?: unknown;
};

const TYPES_MAP = {
    [DataType.CHAR_STR]: "string",
    [DataType.LONG_CHAR_STR]: "string",
    [DataType.OCTET_STR]: "string",
    [DataType.LONG_OCTET_STR]: "string",
};

function AttributeValueInput(props: Readonly<AttributeValueInputProps>): JSX.Element {
    const { value, onChange, attribute, definition, ...rest } = props;
    const type = TYPES_MAP[definition.type] ?? "number";

    return (
        <input
            type={type}
            value={value as string | number}
            onChange={(e): void => {
                const val = type === "number" ? e.target.valueAsNumber : e.target.value;

                onChange(attribute, val);
            }}
            {...rest}
        />
    );
}

export function AttributeEditor(props: AttributeEditorProps) {
    const { device, readDeviceAttributes, writeDeviceAttributes, lastLog } = props;
    const [endpoint, setEndpoint] = useState(getObjectFirstKey(device.endpoints));
    const [cluster, setCluster] = useState("");
    const [attributes, setAttributes] = useState<AttributeInfo[]>([]);
    const { t } = useTranslation(["common", "zigbee"]);

    const selectedAttributes = useMemo(
        () =>
            attributes.length > 0 && (
                <fieldset className="fieldset flex flex-row flex-wrap gap-2 p-3 rounded-box shadow-md" data-testid="selected-attribute">
                    {attributes.map(({ attribute, value = "", definition }) => (
                        <div key={attribute} className="join">
                            {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                            <label className="input join-item">
                                {attribute}
                                <AttributeValueInput
                                    value={value as string | number}
                                    attribute={attribute}
                                    definition={definition}
                                    onChange={(attribute, value): void => {
                                        const newAttributes = [...attributes];
                                        const attr = newAttributes.find((info) => info.attribute === attribute);

                                        if (attr) {
                                            attr.value = value;
                                        }

                                        setAttributes(newAttributes);
                                    }}
                                    data-testid="attribute-value-input"
                                />
                            </label>
                            <Button<string>
                                className="btn btn-error btn-outline join-item"
                                item={attribute}
                                data-testid="remove-attribute"
                                onClick={(attribute): void => {
                                    const newAttributes = attributes.filter((info) => info.attribute !== attribute);

                                    setAttributes(newAttributes);
                                }}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    ))}
                </fieldset>
            ),
        [attributes],
    );
    const availableClusters = useMemo(() => {
        const clusters = new Set<string>();

        if (endpoint) {
            const deviceEndpoint = device.endpoints[Number.parseInt(endpoint, 10)];

            for (const inCluster of deviceEndpoint.clusters.input) {
                clusters.add(inCluster);
            }
        }

        return clusters;
    }, [device.endpoints, endpoint]);

    const disableButtons = attributes.length === 0 || cluster === "";
    const endpoints = getEndpoints(device);

    return endpoint ? (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg">{t("zigbee:read_write_attributes")}</h2>
            <div className="flex flex-row flex-wrap gap-2">
                <EndpointPicker
                    data-testid="endpoint-picker"
                    label={t("zigbee:endpoint")}
                    values={endpoints}
                    value={endpoint}
                    onChange={(endpoint) => {
                        setCluster("");
                        setAttributes([]);
                        setEndpoint(endpoint.toString());
                    }}
                    required
                />
                <ClusterSinglePicker
                    data-testid="cluster-picker"
                    label={t("cluster")}
                    clusters={availableClusters}
                    value={cluster}
                    onChange={(cluster) => {
                        setAttributes([]);
                        setCluster(cluster);
                    }}
                    required
                />
                <AttributePicker
                    data-testid="attribute-picker"
                    label={t("attribute")}
                    value={""}
                    cluster={cluster}
                    device={device}
                    onChange={(attribute, definition): void => {
                        if (!attributes.find((info) => info.attribute === attribute)) {
                            const newAttributes = attributes.concat([{ attribute, definition }]);

                            setAttributes(newAttributes);
                        }
                    }}
                />
            </div>
            {selectedAttributes}
            <div className="flex flex-row flex-wrap join">
                <Button<void>
                    disabled={disableButtons}
                    className="btn btn-success join-item"
                    data-testid="read-attribute"
                    onClick={async () => {
                        await readDeviceAttributes(
                            device.ieee_address,
                            endpoint,
                            cluster,
                            attributes.map((info) => info.attribute),
                            {},
                        );
                    }}
                >
                    {t("read")}
                </Button>
                <Button<void>
                    disabled={disableButtons}
                    className="btn btn-error join-item"
                    data-testid="write-attribute"
                    onClick={async () => {
                        await writeDeviceAttributes(device.ieee_address, endpoint, cluster, attributes, {});
                    }}
                >
                    {t("write")}
                </Button>
            </div>
            {lastLog && <LastLogResult message={lastLog} />}
        </div>
    ) : (
        <>No endpoints</>
    );
}
