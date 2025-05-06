import NiceModal from "@ebay/nice-modal-react";
import type { ButtonHTMLAttributes, JSX } from "react";
import { DialogConfirmationModal } from "../modal/components/DialogConfirmationModal.js";

interface ButtonProps<T> extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    item?: T;
    onClick?(entity: T): Promise<void> | void;
    prompt?: boolean | string;
}

export default function Button<T>(props: ButtonProps<T>): JSX.Element {
    const { children, item, onClick, prompt, ...rest } = props;

    const onConfirmHandler = async (): Promise<void> => {
        await onClick?.(item as T);
    };

    const onClickHandler = async (): Promise<void> => {
        if (prompt) {
            NiceModal.show(DialogConfirmationModal, { onConfirmHandler });
        } else {
            await onClick?.(item as T);
        }
    };

    return (
        <button type="button" {...rest} onClick={onClickHandler}>
            {children}
        </button>
    );
}
