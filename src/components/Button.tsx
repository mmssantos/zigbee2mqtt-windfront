import type { ButtonHTMLAttributes, JSX } from "react";

interface ButtonProps<T> extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    item?: T;
    onClick?(entity: T): Promise<void> | void;
}

export default function Button<T>(props: ButtonProps<T>): JSX.Element {
    const { children, item, onClick, ...rest } = props;

    return (
        <button type="button" {...rest} onClick={async () => await onClick?.(item as T)}>
            {children}
        </button>
    );
}
