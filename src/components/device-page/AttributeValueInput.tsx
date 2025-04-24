import type { ChangeEvent, JSX } from "react";
import { DataType } from "../../ZCLenums.js";
import type { AttributeValueInputProps } from "./AttributeEditor.js";

const TYPES_MAP = {
    [DataType.CHAR_STR]: "string",
    [DataType.LONG_CHAR_STR]: "string",
    [DataType.OCTET_STR]: "string",
    [DataType.LONG_OCTET_STR]: "string",
};

export function AttributeValueInput(props: Readonly<AttributeValueInputProps>): JSX.Element {
    const { value, onChange, attribute, definition, ...rest } = props;
    const type = TYPES_MAP[definition.type] ?? "number";

    const onValueChanged = (e: ChangeEvent<HTMLInputElement>): void => {
        const val = type === "number" ? e.target.valueAsNumber : e.target.value;
        onChange(attribute, val);
    };

    return <input className="form-control" type={type} value={value as string | number} onChange={onValueChanged} {...rest} />;
}
