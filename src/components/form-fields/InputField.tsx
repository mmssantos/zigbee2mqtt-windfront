import type { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputFieldProps<T> = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    type: T;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

export function InputField<T>(props: InputFieldProps<T>) {
    const { label, onChange, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <input className="input" onChange={onChange} {...rest} />
        </fieldset>
    );
}
