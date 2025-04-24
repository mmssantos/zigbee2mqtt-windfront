import type { ChangeEvent } from "react";

import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "../button/Button.js";
import { DisplayValue } from "../display-value/DisplayValue.js";

type ToggleProps = {
    onChange(value: unknown): void;
    value: unknown;
    name: string;
    valueOn: unknown;
    valueOff: unknown;
    minimal?: boolean;
};
type ControlButtonProps = {
    value: unknown;
    onClick(value: unknown): void;
    name: string;
};

function ControlButton(props: ControlButtonProps) {
    const { value, onClick, name } = props;
    return (
        <Button<unknown> className="btn btn-link" item={value} onClick={onClick}>
            <DisplayValue value={value} name={name} />
        </Button>
    );
}

export default function Toggle(props: ToggleProps) {
    const { onChange, value, valueOn, valueOff, minimal, name } = props;

    const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked ? valueOn : valueOff);
    const valueExists = value != null;
    const showOnOffButtons = !minimal || (minimal && !valueExists);
    return (
        <div>
            {showOnOffButtons && <ControlButton value={valueOff} name={name} onClick={onChange} />}
            {valueExists ? (
                <input className="toggle" type="checkbox" checked={value === valueOn} onChange={onCheckboxChange} />
            ) : (
                <FontAwesomeIcon icon={faQuestion} title="Current value unknown" />
            )}
            {showOnOffButtons && <ControlButton value={valueOn} name={name} onClick={onChange} />}
        </div>
    );
}
