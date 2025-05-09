import { type InputHTMLAttributes, memo, useEffect, useState } from "react";

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
    value: string;
    onChange(value: string): void;
};

const TextEditor = memo((props: TextProps) => {
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
});

export default TextEditor;
