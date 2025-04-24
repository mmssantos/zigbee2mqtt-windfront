import { Fragment, type InputHTMLAttributes, useEffect, useState } from "react";

type TextualProps = {
    value: string;
    unit?: string;
    onChange(value: string): void;
};

export default function TextualEditor(props: TextualProps & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const { onChange, value, unit, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    return (
        <Fragment>
            <input
                type="text"
                className="form-control"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={() => onChange(currentValue)}
                {...rest}
            />
            {unit ? (
                <span className="input-group-text" style={{ minWidth: "66px" }}>
                    {unit}
                </span>
            ) : null}
        </Fragment>
    );
}
