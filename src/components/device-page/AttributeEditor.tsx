import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LogMessage } from "../../store.js";
import type { Attribute, Cluster, Device, Endpoint, FriendlyName, IEEEEAddress } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import AttributePicker, { type AttributeDefinition } from "../attribute-picker/AttributePicker.js";
import Button from "../button/Button.js";
import ClusterPicker from "../cluster-picker/ClusterPicker.js";
import { PickerType } from "../cluster-picker/index.js";
import EndpointPicker from "../endpoint-picker/EndpointPicker.js";
import { AttributeValueInput } from "./AttributeValueInput.js";
import { LastLogResult } from "./LastLogResult.js";

export interface AttributeEditorProps {
    device: Device;
    logs: LogMessage[];
    readDeviceAttributes(
        id: FriendlyName | IEEEEAddress,
        endpoint: Endpoint,
        cluster: Cluster,
        attributes: Attribute[],
        options: Record<string, unknown>,
    ): Promise<void>;
    writeDeviceAttributes(
        id: FriendlyName | IEEEEAddress,
        endpoint: Endpoint,
        cluster: Cluster,
        attributes: AttributeInfo[],
        options: Record<string, unknown>,
    ): Promise<void>;
}
export type AttributeInfo = {
    attribute: Attribute;
    definition: AttributeDefinition;
    value?: unknown;
};

export type AttributeEditorState = {
    cluster: Cluster;
    endpoint: Endpoint;
    attributes: AttributeInfo[];
};

export type AttributeValueInputProps = {
    onChange(attribute: Attribute, value: unknown): void;
    attribute: Attribute;
    definition: AttributeDefinition;
    value?: unknown;
};

const LOG_STARTING_STRINGS = ["Read result of", "Publish 'set' 'read' to", "Publish 'set' 'write' to", "Wrote "];

export function AttributeEditor(props: AttributeEditorProps) {
    const { device, readDeviceAttributes, writeDeviceAttributes } = props;
    const defaultEndpoint = Object.keys(device.endpoints)[0];
    const [state, setState] = useState<AttributeEditorState>({
        endpoint: defaultEndpoint,
        cluster: "",
        attributes: [],
    });
    const { t } = useTranslation(["common", "zigbee"]);

    const onEndpointChange = (endpoint: Endpoint): void => {
        setState({ ...state, attributes: [], cluster: "", endpoint });
    };

    const onClusterChange = (cluster: Cluster): void => {
        setState({ ...state, attributes: [], cluster });
    };

    const onAttributeSelect = (attribute: Attribute, definition: AttributeDefinition): void => {
        const { attributes } = state;
        if (!attributes.find((info) => info.attribute === attribute)) {
            const newAttributes = attributes.concat([{ attribute, definition }]);
            setState({ ...state, attributes: newAttributes });
        }
    };

    const onAttributeDelete = (attribute: Attribute): void => {
        const { attributes } = state;
        const newAttributes = attributes.filter((info) => info.attribute !== attribute);
        setState({ ...state, attributes: newAttributes });
    };

    const onReadClick = async (): Promise<void> => {
        const { cluster, attributes, endpoint } = state;
        await readDeviceAttributes(
            device.friendly_name,
            endpoint,
            cluster,
            attributes.map((info) => info.attribute),
            {},
        );
    };

    const onWriteClick = async (): Promise<void> => {
        const { device } = props;
        const { cluster, attributes, endpoint } = state;
        await writeDeviceAttributes(device.friendly_name, endpoint, cluster, attributes, {});
    };

    const onAttributeValueChange = (attribute: Attribute, value: unknown): void => {
        const { attributes } = state;
        const newAttributes = [...attributes];
        const attr = newAttributes.find((info) => info.attribute === attribute);
        if (attr) {
            attr.value = value;
        }
        setState({ ...state, attributes: newAttributes });
    };

    const renderSelectedAttribute = (): JSX.Element[] => {
        const { attributes } = state;
        return attributes.map(({ attribute, value = "", definition }) => (
            <div key={attribute} className="row mb-1">
                <div className="col-3">
                    <div className="row">
                        <div className="col-6">{attribute}</div>
                        <div className="col-3">
                            <AttributeValueInput
                                value={value as string | number}
                                attribute={attribute}
                                definition={definition}
                                onChange={onAttributeValueChange}
                                data-testid="attribute-value-input"
                            />
                        </div>
                        <div className="col-2">
                            <Button<Attribute>
                                className="btn btn-error btn-sm"
                                item={attribute}
                                data-testid="remove-attribute"
                                onClick={onAttributeDelete}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        ));
    };

    const { cluster, attributes, endpoint } = state;
    const noAttributesSelected = attributes.length === 0;
    const noSelectedCluster = cluster === "";
    const endpoints = getEndpoints(device);
    const logsFilterFn = (l: LogMessage) => LOG_STARTING_STRINGS.some((startString) => l.message.startsWith(startString));

    if (!endpoint) {
        return <>No endpoints</>;
    }
    return (
        <>
            <div className="mb-3 row">
                <div className="col-6 col-sm-3">
                    <EndpointPicker
                        data-testid="endpoint-picker"
                        label={t("zigbee:endpoint")}
                        values={endpoints}
                        value={endpoint as Endpoint}
                        onChange={onEndpointChange}
                    />
                </div>
                <div className="col-6 col-sm-3">
                    <ClusterPicker
                        data-testid="cluster-picker"
                        label={t("cluster")}
                        pickerType={PickerType.SINGLE}
                        clusters={device.endpoints[endpoint].clusters.input}
                        value={cluster}
                        onChange={onClusterChange}
                    />
                </div>

                <div className="col-6 col-sm-3">
                    <AttributePicker
                        data-testid="attribute-picker"
                        label={t("attribute")}
                        value={""}
                        cluster={cluster}
                        device={device}
                        onChange={onAttributeSelect}
                    />
                </div>
            </div>
            <div className="mb-3 row" data-testid="selected-attribute">
                {renderSelectedAttribute()}
            </div>
            <div className="mb-3 row">
                <div className="join col col-3">
                    <Button<void>
                        disabled={noAttributesSelected || noSelectedCluster}
                        className="btn btn-success join-item me-2"
                        data-testid="read-attribute"
                        onClick={onReadClick}
                    >
                        {t("read")}
                    </Button>
                    <Button<void>
                        disabled={noAttributesSelected || noSelectedCluster}
                        className="btn btn-error join-item"
                        data-testid="write-attribute"
                        onClick={onWriteClick}
                    >
                        {t("write")}
                    </Button>
                </div>
            </div>
            <LastLogResult logs={props.logs} filterFn={logsFilterFn} />
        </>
    );
}
