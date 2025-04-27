import NiceModal from "@ebay/nice-modal-react";
import type { ButtonHTMLAttributes, JSX } from "react";
import { DialogConfirmationModal } from "../modal/components/DialogConfirmationModal.js";

interface ButtonProps<T> extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    item?: T;
    onClick?(entity: T): void;
    prompt?: boolean | string;
}

export default function Button<T>(props: ButtonProps<T>): JSX.Element {
    const { children, item, onClick, prompt, ...rest } = props;

    const onConfirmHandler = (): void => {
        onClick?.(item as T);
    };
    const onClickHandler = (): void => {
        if (prompt) {
            NiceModal.show(DialogConfirmationModal, { onConfirmHandler });
        } else {
            onClick?.(item as T);
        }
    };

    return (
        <button type="button" {...rest} onClick={onClickHandler}>
            {children}
        </button>
    );
}
