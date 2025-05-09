import { type InputHTMLAttributes, memo, useEffect, useState } from "react";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "./EnumEditor.js";

type RangeProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value: number;
    valueStep?: number;
    unit?: string;
    onChange(value: number): void;
    steps?: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
};

const RangeEditor = memo((props: RangeProps) => {
    const { onChange, value, valueStep, min, max, unit, steps, minimal, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number>(value);
    const showRange = min != null && max != null;

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    return (
        <div className="flex flex-row flex-wrap gap-3 items-center">
            {!minimal && steps ? <EnumEditor values={steps} onChange={onChange} value={currentValue} /> : null}
            {showRange ? (
                <div className="w-full max-w-xs">
                    <input
                        min={min}
                        max={max}
                        step={valueStep}
                        type="range"
                        className="range range-xs range-primary"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.valueAsNumber)}
                        onTouchEnd={() => onChange(currentValue)}
                        onMouseUp={() => onChange(currentValue)}
                        {...rest}
                    />
                    <div className="flex justify-between px-1 mt-1 text-xs">
                        <span>|</span>
                        <span>|</span>
                    </div>
                    <div className="flex justify-between px-1 mt-1 text-xs">
                        <span>{min}</span>
                        <span>{max}</span>
                    </div>
                </div>
            ) : null}
            {(!minimal || !showRange) && (
                <label className="input">
                    {unit}
                    <input
                        type="number"
                        className="grow"
                        value={currentValue}
                        step={valueStep}
                        onChange={(e) => setCurrentValue(e.target.valueAsNumber)}
                        onBlur={() => onChange(currentValue)}
                        min={min}
                        max={max}
                        {...rest}
                    />
                </label>
            )}
        </div>
    );
});

export default RangeEditor;
