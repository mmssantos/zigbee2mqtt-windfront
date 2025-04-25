import type { ChangeEvent, SelectHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import type { Endpoint } from "../../types.js";
import { SelectField } from "../form-fields/SelectField.js";

interface EndpointPickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    onChange(endpoint: Endpoint): void;
    value: Endpoint;
    label?: string;
    values: Endpoint[];
}

export default function EndpointPicker(props: EndpointPickerProps) {
    const { value, values, disabled, onChange, label, ...rest } = props;
    const { t } = useTranslation("common");
    const onSelectHandler = (e: ChangeEvent<HTMLSelectElement>): void => {
        onChange(e.target.value);
    };
    const hasOnlyOneEP = values.length === 1;

    const options = values.map((ep) => (
        <option key={ep} value={ep}>
            {ep}
        </option>
    ));
    options.unshift(
        <option key="hided" hidden>
            {t("select_endpoint")}
        </option>,
    );

    return (
        <SelectField
            name="endpoint_picker"
            label={label}
            defaultValue={value}
            onChange={onSelectHandler}
            title={hasOnlyOneEP ? t("the_only_endpoint") : ""}
            disabled={(value && hasOnlyOneEP) || disabled}
            {...rest}
        >
            {options}
        </SelectField>
    );
}
