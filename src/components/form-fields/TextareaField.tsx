import { type ChangeEvent, type DetailedHTMLProps, type TextareaHTMLAttributes, useCallback } from "react";

export type TextAreaFieldProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> & {
    name: string;
    label?: string;
    detail?: string;
    onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

export default function TextareaField(props: TextAreaFieldProps) {
    const { label, detail, onChange, ...rest } = props;

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            if (onChange && !e.target.validationMessage) {
                onChange(e);
            }
        },
        [onChange],
    );

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <textarea className={`textarea${props.required ? " validator" : ""}`} onChange={onValidChange} {...rest} />
            {detail && <div className="label">{detail}</div>}
        </fieldset>
    );
}
