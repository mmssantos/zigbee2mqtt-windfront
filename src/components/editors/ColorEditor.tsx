import { type InputHTMLAttributes, useMemo } from "react";
import type { AnyColor, ColorFormat } from "../../types.js";
import Button from "../Button.js";
import { toRGB } from "./index.js";

type ColorEditorProps = {
    value: AnyColor;
    format: ColorFormat;
    onChange(value: { hex: string }): void;
    minimal?: boolean;
};

const WHITE_PALLET = ["#FFFFFF", "#FDF4DC", "#F4FDFF"];
const PRIDE_PALLET = ["#FF0018", "#FFA52C", "#FFFF41", "#008018", "#0000F9", "#86007D"];

const getPalletKey = (pallet: string[]) => pallet.join("-");

export default function ColorEditor(props: ColorEditorProps & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
    const { onChange, value = {} as AnyColor, format, minimal, ...rest } = props;
    const currentColor = useMemo(() => toRGB(value, format), [value, format]);

    return (
        <div className="flex flex-row flex-wrap gap-2 items-center">
            {!minimal &&
                [PRIDE_PALLET, WHITE_PALLET].map((pallet) => (
                    <div key={getPalletKey(pallet)} className="join join-vertical lg:join-horizontal">
                        {pallet.map((step) => (
                            <Button<string>
                                className="btn btn-sm btn-square join-item"
                                style={{ backgroundColor: step }}
                                key={step}
                                item={step}
                                title={step}
                                onClick={(item) => onChange({ hex: item })}
                            />
                        ))}
                    </div>
                ))}

            <input
                type="color"
                className="color"
                value={currentColor}
                onChange={(e) => {
                    if (e.target.value.toLowerCase() !== currentColor.toLowerCase()) {
                        onChange({ hex: e.target.value });
                    }
                }}
                {...rest}
            />
        </div>
    );
}
