import { type InputHTMLAttributes, useEffect, useState } from "react";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "./EnumEditor.js";

type RangeProps = {
    value: number;
    valueStep?: number;
    unit?: string;
    onChange(value: number): void;
    steps?: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
};

export default function RangeEditor(props: RangeProps & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
    const { onChange, value, valueStep, min, max, unit, steps, minimal, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<number>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const showRange = min != null && max != null;
    return (
        <div className="flex flex-row flex-wrap gap-2 items-center">
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
                <input
                    type="number"
                    className={`input${showRange ? " ms-1" : ""}`}
                    value={currentValue}
                    step={valueStep}
                    onChange={(e) => setCurrentValue(e.target.valueAsNumber)}
                    onBlur={() => onChange(currentValue)}
                    onMouseUp={() => onChange(currentValue)}
                    min={min}
                    max={max}
                    {...rest}
                    style={showRange ? { maxWidth: "100px" } : {}}
                />
            )}
            {!minimal && unit ? (
                <span className="input" style={{ minWidth: "66px" }}>
                    {unit}
                </span>
            ) : null}
        </div>
    );
}
