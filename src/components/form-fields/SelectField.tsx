import { type ChangeEvent, type DetailedHTMLProps, type SelectHTMLAttributes, useCallback } from "react";

export type SelectFieldProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange(event: ChangeEvent<HTMLSelectElement>): void;
};

export default function SelectField(props: SelectFieldProps) {
    const { label, detail, onChange, children, ...rest } = props;

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            if (!e.target.validationMessage) {
                onChange(e);
            }
        },
        [onChange],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <select className={`select${props.required ? " validator" : ""}`} onChange={onValidChange} {...rest}>
                {children}
            </select>
            {detail && <span className="label">{detail}</span>}
        </fieldset>
    );
}
