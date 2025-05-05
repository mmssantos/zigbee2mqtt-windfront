import { type ChangeEvent, type DetailedHTMLProps, type FocusEvent, type InputHTMLAttributes, useCallback } from "react";

export type InputFieldProps<T> = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    detail?: string;
    type: T;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
};

export default function InputField<T>(props: InputFieldProps<T>) {
    const { label, detail, onChange, onBlur, ...rest } = props;

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (onChange && !e.target.validationMessage) {
                onChange(e);
            }
        },
        [onChange],
    );

    const onValidBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            if (onBlur && !e.target.validationMessage) {
                onBlur(e);
            }
        },
        [onBlur],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <input
                className={`input${props.pattern || props.required ? " validator" : ""}`}
                onChange={onValidChange}
                onBlur={onValidBlur}
                {...rest}
            />
            {detail && <p className="label">{detail}</p>}
        </fieldset>
    );
}
