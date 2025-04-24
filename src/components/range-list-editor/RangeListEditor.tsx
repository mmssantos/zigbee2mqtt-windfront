import { useEffect, useState } from "react";
import Button from "../button/Button.js";
import RangeEditor from "../range-editor/RangeEditor.js";

type RangeListProps = {
    value: number[];
    onChange(value: number[]): void;
    minimal?: boolean;
};

export default function RangeListEditor(props: RangeListProps) {
    const { onChange, value: listValue, minimal, ...rest } = props;
    const [currentListValue, setCurrentListValue] = useState<number[]>(listValue);

    useEffect(() => {
        setCurrentListValue(listValue);
    }, [listValue]);

    const replaceList = (newListValue: number[]) => {
        setCurrentListValue(newListValue);
        onChange(newListValue);
    };

    const onItemChange = (itemValue: number, itemIndex: number) => {
        const newListValue = [...currentListValue];
        newListValue[itemIndex] = itemValue;
        replaceList(newListValue);
    };

    const handleRemoveClick = (itemIndex: number) => () => {
        const newListValue = [...currentListValue];
        newListValue.splice(itemIndex, 1);
        replaceList(newListValue);
    };

    const handleAddClick = () => replaceList([...currentListValue, 0]);

    if (currentListValue.length === 0) {
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
            {currentListValue.map((itemValue, itemIndex) => {
                const showAddButton = currentListValue.length - 1 === itemIndex;
                return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: no fixed value type
                    <div className="mt-3 mb-3 row" key={itemIndex}>
                        <div className="col-10">
                            <RangeEditor onChange={(newValue) => onItemChange(newValue, itemIndex)} value={itemValue} minimal={minimal} {...rest} />
                        </div>
                        <div className="join col-2">
                            <Button<void> className="btn btn-error join-item me-2" onClick={handleRemoveClick(itemIndex)}>
                                -
                            </Button>
                            <Button<void> className={`btn btn-success join-item ${showAddButton ? "" : "invisible"}`} onClick={handleAddClick}>
                                +
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
