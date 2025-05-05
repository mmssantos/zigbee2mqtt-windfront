import { type ChangeEvent, type DetailedHTMLProps, type FocusEvent, type InputHTMLAttributes, useCallback, useEffect, useState } from "react";

export type NumberFieldProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

export default function NumberField(props: NumberFieldProps) {
    const { label, detail, onChange, onBlur, defaultValue, ...rest } = props;
    const [currentValue, setCurrentValue] = useState(defaultValue || props.min || "");

    useEffect(() => {
        setCurrentValue(defaultValue || "");
    }, [defaultValue]);

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (!e.target.validationMessage) {
                setCurrentValue(e.target.valueAsNumber);
                onChange?.(e);
            }
        },
        [onChange],
    );

    const onValidBlur = useCallback(
        (e) => {
            if (onBlur && !e.target.validationMessage) {
                onBlur(e);
            }
        },
        [onBlur],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            {props.min != null && props.max != null && (
                <div className="w-full max-w-xs">
                    <input
                        className="range range-xs range-primary"
                        onChange={onValidChange}
                        onTouchEnd={onValidBlur}
                        onMouseUp={onValidBlur}
                        {...rest}
                        type="range"
                        value={currentValue}
                    />
                    <div className="flex justify-between px-1 mt-1 text-xs">
                        <span>|</span>
                        <span>|</span>
                    </div>
                    <div className="flex justify-between px-1 mt-1 text-xs">
                        <span>{props.min}</span>
                        <span>{props.max}</span>
                    </div>
                </div>
            )}
            <input
                className={`input${props.pattern || props.required ? " validator" : ""}`}
                onChange={onValidChange}
                onBlur={onValidBlur}
                {...rest}
                value={currentValue}
            />
            {detail && <p className="label whitespace-normal">{detail}</p>}
        </fieldset>
    );
}
