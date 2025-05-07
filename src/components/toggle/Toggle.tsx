import type { ChangeEvent } from "react";

import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import Button from "../button/Button.js";
import { DisplayValue } from "../value-decorators/DisplayValue.js";

type ToggleProps = {
    onChange(value: unknown): void;
    value: unknown;
    name: string;
    valueOn: unknown;
    valueOff: unknown;
    minimal?: boolean;
};

export default function Toggle(props: ToggleProps) {
    const { onChange, value, valueOn, valueOff, minimal, name } = props;
    const { t } = useTranslation("zigbee");

    const onCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked ? valueOn : valueOff);
    const valueExists = value != null;
    const showOnOffButtons = !minimal || (minimal && !valueExists);

    return (
        <div>
            {showOnOffButtons && (
                <Button<unknown> className="btn btn-link" item={valueOff} onClick={onChange}>
                    <DisplayValue value={valueOff} name={name} />
                </Button>
            )}
            {valueExists ? (
                <input className="toggle" type="checkbox" checked={value === valueOn} onChange={onCheckboxChange} />
            ) : (
                <FontAwesomeIcon icon={faQuestion} title={t("unknown")} />
            )}
            {showOnOffButtons && (
                <Button<unknown> className="btn btn-link" item={valueOn} onClick={onChange}>
                    <DisplayValue value={valueOn} name={name} />
                </Button>
            )}
        </div>
    );
}
