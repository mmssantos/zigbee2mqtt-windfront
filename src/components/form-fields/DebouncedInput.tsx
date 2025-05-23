import { type InputHTMLAttributes, memo, useEffect, useState } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> & {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
};

/** A typical debounced input react component */
const DebouncedInput = memo(({ value: initialValue, onChange, debounce = 500, ...props }: Props) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, onChange]);

    return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
});

export default DebouncedInput;
