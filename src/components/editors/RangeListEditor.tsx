import { useCallback, useEffect, useState } from "react";
import Button from "../Button.js";
import RangeEditor from "./RangeEditor.js";

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

    const replaceList = useCallback(
        (newListValue: number[]) => {
            setCurrentListValue(newListValue);
            onChange(newListValue);
        },
        [onChange],
    );

    const onItemChange = useCallback(
        (itemValue: number, itemIndex: number) => {
            const newListValue = Array.from(currentListValue);
            newListValue[itemIndex] = itemValue;

            replaceList(newListValue);
        },
        [currentListValue, replaceList],
    );

    const handleRemoveClick = useCallback(
        (itemIndex: number) => {
            const newListValue = Array.from(currentListValue);
            newListValue.splice(itemIndex, 1);

            replaceList(newListValue);
        },
        [currentListValue, replaceList],
    );

    const handleAddClick = useCallback(() => replaceList([...currentListValue, 0]), [currentListValue, replaceList]);

    return currentListValue.length === 0 ? (
        <div className="flex flex-row flex-wrap">
            <Button<void> className="btn btn-success" onClick={handleAddClick}>
                +
            </Button>
        </div>
    ) : (
        <>
            {currentListValue.map((itemValue, itemIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: no better way?
                <div className="flex flex-row flex-wrap gap-2" key={`${itemValue}-${itemIndex}`}>
                    <div className="">
                        <RangeEditor onChange={(newValue) => onItemChange(newValue, itemIndex)} value={itemValue} minimal={minimal} {...rest} />
                    </div>
                    <div className="join join-vertical lg:join-horizontal">
                        <Button<number> item={itemIndex} className="btn btn-error btn-square join-item" onClick={handleRemoveClick}>
                            -
                        </Button>
                        {currentListValue.length - 1 === itemIndex && (
                            <Button<void> className="btn btn-success btn-square join-item" onClick={handleAddClick}>
                                +
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}
