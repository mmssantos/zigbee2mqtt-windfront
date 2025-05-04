import { type InputHTMLAttributes, useEffect, useState } from "react";

type TextProps = {
    value: string;
    onChange(value: string): void;
};

export default function TextEditor(props: TextProps & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const { onChange, value, ...rest } = props;
    const [currentValue, setCurrentValue] = useState<string>(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    return (
        <input
            type="text"
            className="input"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={() => onChange(currentValue)}
            {...rest}
        />
    );
}
