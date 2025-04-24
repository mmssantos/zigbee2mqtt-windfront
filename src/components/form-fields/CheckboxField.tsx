import type { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";

type CheckboxFieldProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    desc: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

export function CheckboxField(props: CheckboxFieldProps) {
    const { type, label, desc, onChange, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <input className="checkbox" type="checkbox" onChange={onChange} {...rest} />
            {desc}
        </fieldset>
    );
}
