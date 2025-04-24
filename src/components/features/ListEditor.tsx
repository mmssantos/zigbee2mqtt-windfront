import { useEffect, useState } from "react";
import type { CompositeFeature, Device, DeviceState, GenericExposedFeature, GenericOrCompositeFeature } from "../../types.js";
import Button from "../button/Button.js";
import { Feature } from "./composite/Feature.js";
import FeatureWrapper from "./composite/FeatureWrapper.js";

type ListEditorProps = {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    onChange(value: any[]): void;
    feature: GenericOrCompositeFeature;
    parentFeatures: (CompositeFeature | GenericExposedFeature)[];
};

export default function ListEditor(props: ListEditorProps) {
    const { onChange, value, feature, parentFeatures } = props;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const [currentValue, setCurrentValue] = useState<any[]>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const replaceList = (newListValue: any[]) => {
        setCurrentValue(newListValue);
        onChange(newListValue);
    };

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const onItemChange = (itemValue: any, itemIndex: number) => {
        const newListValue = [...currentValue];
        if (typeof itemValue === "object") {
            itemValue = { ...currentValue[itemIndex], ...itemValue };
        }
        newListValue[itemIndex] = itemValue;
        replaceList(newListValue);
    };

    const handleRemoveClick = (itemIndex: number) => () => {
        const newListValue = [...currentValue];
        newListValue.splice(itemIndex, 1);
        replaceList(newListValue);
    };

    const handleAddClick = () => setCurrentValue([...currentValue, {}]);

    if (currentValue.length === 0) {
        return (
            <div className="mt-3 mb-3 row">
                <Button<void> className="btn btn-success col-1 me-2" onClick={handleAddClick}>
                    +
                </Button>
            </div>
        );
    }
    return (
        <div>
            {currentValue.map((itemValue, itemIndex) => {
                const showAddButton = currentValue.length - 1 === itemIndex;
                return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: don't have a fixed value type
                    <div className="mt-3 mb-3 row" key={itemIndex}>
                        <div className="col-10">
                            <Feature
                                feature={feature as CompositeFeature}
                                device={{} as Device}
                                deviceState={itemValue as DeviceState}
                                onChange={(_endpoint, value) => {
                                    onItemChange(value, itemIndex);
                                }}
                                onRead={(_a, _b) => {}}
                                featureWrapperClass={FeatureWrapper}
                                parentFeatures={parentFeatures}
                            />
                        </div>
                        <div className="col-2">
                            <div className="join">
                                <Button<void> className="btn btn-error join-item me-2" onClick={handleRemoveClick(itemIndex)}>
                                    -
                                </Button>
                                <Button<void> className={`btn btn-success join-item ${showAddButton ? "" : "invisible"}`} onClick={handleAddClick}>
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
