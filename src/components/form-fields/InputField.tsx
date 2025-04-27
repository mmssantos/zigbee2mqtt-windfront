import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, useCallback } from "react";

export type InputFieldProps<T> = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    detail?: string;
    type: T;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

export default function InputField<T>(props: InputFieldProps<T>) {
    const { label, detail, onChange, ...rest } = props;

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (!e.target.validationMessage) {
                onChange(e);
            }
        },
        [onChange],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <input className={`input${props.pattern || props.required ? " validator" : ""}`} onChange={onValidChange} {...rest} />
            {detail && <p className="label">{detail}</p>}
        </fieldset>
    );
}
