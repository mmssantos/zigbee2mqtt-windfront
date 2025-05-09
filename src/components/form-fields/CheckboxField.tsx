import { type ChangeEvent, type DetailedHTMLProps, type InputHTMLAttributes, memo, useCallback } from "react";

type CheckboxFieldProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
};

const CheckboxField = memo((props: CheckboxFieldProps) => {
    const { type, label, detail, onChange, ...rest } = props;

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
            {detail ? (
                <label className="label">
                    <input className={`checkbox${props.required ? " validator" : ""}`} type="checkbox" onChange={onValidChange} {...rest} />
                    {detail}
                </label>
            ) : (
                <input className={`checkbox${props.required ? " validator" : ""}`} type="checkbox" onChange={onValidChange} {...rest} />
            )}
        </fieldset>
    );
});

export default CheckboxField;
