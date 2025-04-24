import type { ChangeEvent, DetailedHTMLProps, SelectHTMLAttributes } from "react";

type SelectFieldProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    name: string;
    label?: string;
    onChange(event: ChangeEvent<HTMLSelectElement>): void;
};

export function SelectField(props: SelectFieldProps) {
    const { label, onChange, children, ...rest } = props;

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <select className="select" onChange={onChange} {...rest}>
                {children}
            </select>
        </fieldset>
    );
}
