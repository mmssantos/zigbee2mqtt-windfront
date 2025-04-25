import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, useCallback } from "react";

export type CheckboxFieldProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    desc: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

export default function CheckboxField(props: CheckboxFieldProps) {
    const { type, label, desc, onChange, ...rest } = props;

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
            <input className={`checkbox${props.required ? " validator" : ""}`} type="checkbox" onChange={onValidChange} {...rest} />
            {desc}
        </fieldset>
    );
}
