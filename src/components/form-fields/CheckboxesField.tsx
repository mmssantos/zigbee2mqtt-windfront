import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import Button from "../Button.js";

export type CheckboxFieldProps = {
    names: string[];
    defaultsChecked: string[];
    label?: string;
    detail?: string;
    onSubmit(values: string[]): void;
};

export default function CheckboxesField(props: CheckboxFieldProps) {
    const { names, label, detail, defaultsChecked, onSubmit } = props;
    const [currentValues, setCurrentValues] = useState<string[]>(defaultsChecked || []);

    useEffect(() => {
        setCurrentValues(defaultsChecked || []);
    }, [defaultsChecked]);

    const onValidChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (!e.target.validationMessage) {
                let newValues = Array.from(currentValues);

                if (e.target.checked) {
                    newValues.push(e.target.name);
                } else {
                    newValues = newValues.filter((v) => v !== e.target.name);
                }

                setCurrentValues(newValues);
            }
        },
        [currentValues],
    );

    return (
        <fieldset className="fieldset gap-2">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div className="flex flex-row flex-wrap gap-2">
                {names.map((name) => (
                    <label className="label" key={name}>
                        <input
                            name={name}
                            className="checkbox"
                            type="checkbox"
                            onChange={onValidChange}
                            defaultChecked={defaultsChecked.includes(name)}
                        />
                        {name}
                    </label>
                ))}
            </div>
            <div className="flex flex-row flex-wrap gap-2 items-center mt-1">
                <Button onClick={() => onSubmit(currentValues)} className="btn btn-sm btn-square btn-primary">
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
                <span className="label">{detail}</span>
            </div>
        </fieldset>
    );
}
