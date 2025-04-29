import { useCallback, useEffect, useState } from "react";
import type { CompositeFeature, Device, DeviceState, GenericFeature, GenericOrCompositeFeature } from "../../types.js";
import Button from "../button/Button.js";
import { Feature } from "./Feature.js";
import FeatureWrapper from "./FeatureWrapper.js";

type ListEditorProps = {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    onChange(value: any[]): void;
    feature: GenericOrCompositeFeature;
    parentFeatures: (CompositeFeature | GenericFeature)[];
};

export default function ListEditor(props: ListEditorProps) {
    const { onChange, value, feature, parentFeatures } = props;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const [currentValue, setCurrentValue] = useState<any[]>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const replaceList = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (newListValue: any[]) => {
            setCurrentValue(newListValue);
            onChange(newListValue);
        },
        [onChange],
    );

    const onItemChange = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (itemValue: any, itemIndex: number) => {
            const newListValue = Array.from(currentValue);

            if (typeof itemValue === "object") {
                itemValue = { ...currentValue[itemIndex], ...itemValue };
            }

            newListValue[itemIndex] = itemValue;
            replaceList(newListValue);
        },
        [currentValue, replaceList],
    );

    const handleRemoveClick = useCallback(
        (itemIndex: number) => () => {
            const newListValue = Array.from(currentValue);

            newListValue.splice(itemIndex, 1);
            replaceList(newListValue);
        },
        [currentValue, replaceList],
    );

    const handleAddClick = useCallback(() => setCurrentValue([...currentValue, {}]), [currentValue]);

    return currentValue.length === 0 ? (
        <div className="flex flex-row flex-wrap gap-2 mt-3 mb-3">
            <Button<void> className="btn btn-success col-1" onClick={handleAddClick}>
                +
            </Button>
        </div>
    ) : (
        <div>
            {currentValue.map((itemValue, itemIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: don't have a fixed value type
                <div className="flex flex-row flex-wrap gap-2 mt-3 mb-3" key={itemIndex}>
                    <Feature
                        feature={feature as CompositeFeature}
                        device={{} as Device}
                        deviceState={itemValue as DeviceState}
                        onChange={(value) => onItemChange(value, itemIndex)}
                        onRead={(_value) => {}}
                        featureWrapperClass={FeatureWrapper}
                        parentFeatures={parentFeatures}
                    />
                    <div className="join">
                        <Button<void> className="btn btn-error join-item me-2" onClick={handleRemoveClick(itemIndex)}>
                            -
                        </Button>
                        <Button<void>
                            className={`btn btn-success join-item ${currentValue.length - 1 === itemIndex ? "" : "invisible"}`}
                            onClick={handleAddClick}
                        >
                            +
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
