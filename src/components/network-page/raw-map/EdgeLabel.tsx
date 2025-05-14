import { memo } from "react";

type EdgeLabelProps = {
    className: string;
    transform: string;
    label: string;
    selected?: boolean;
};

const EdgeLabel = memo(({ className, transform, label, selected }: EdgeLabelProps) => {
    return (
        <div
            style={{
                position: "absolute",
                transform,
            }}
            className={`${className} ${selected ? "" : "opacity-50"}`}
        >
            {label}
        </div>
    );
});

export default EdgeLabel;
