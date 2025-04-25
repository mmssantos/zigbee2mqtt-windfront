import Button from "../button/Button.js";
import { DisplayValue } from "../value-decorators/DisplayValue.js";

export type ValueWithLabel = {
    value: number;
    name: string;
    description?: string;
};

export type ValueWithLabelOrPrimitive = ValueWithLabel | number | string;

type EnumProps = {
    value?: ValueWithLabelOrPrimitive;
    onChange(value: unknown): void;
    values: ValueWithLabelOrPrimitive[];
    minimal?: boolean;
};

function isPrimitive(step?: ValueWithLabelOrPrimitive | null): step is number | string {
    return typeof step !== "object";
}

export default function EnumEditor(props: EnumProps) {
    const { onChange, values, value, minimal } = props;

    if (minimal) {
        const onSelectChange = (e) => {
            const selectedValue = values.find((v) => (isPrimitive(v) ? v === e.target.value : v.value === e.target.value));
            onChange(selectedValue);
        };

        return (
            <select className="select" onChange={onSelectChange} value={isPrimitive(value) ? value : value?.value}>
                <option value="" disabled>
                    ---
                </option>
                {values.map((v) => (
                    <option key={isPrimitive(v) ? v : v.name} value={isPrimitive(v) ? v : v.value}>
                        {isPrimitive(v) ? v : v.name}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <div className="join me-2">
            {values.map((v) => (
                <Button<ValueWithLabelOrPrimitive>
                    key={isPrimitive(v) ? v : v.name}
                    className={`btn btn-soft join-item${(isPrimitive(v) ? v === value : v.value === (isPrimitive(value) ? value : value?.value)) ? " btn-active" : ""}`}
                    onClick={(item) => onChange(item)}
                    item={isPrimitive(v) ? v : v.value}
                    title={isPrimitive(v) ? (v as string) : v.description}
                >
                    {isPrimitive(v) ? <DisplayValue value={v} name="" /> : v.name}
                </Button>
            ))}
        </div>
    );
}
