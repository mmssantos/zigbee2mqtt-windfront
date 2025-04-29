import { type InputHTMLAttributes, useEffect, useState } from "react";
import type { AnyColor } from "../../types.js";
import Button from "../button/Button.js";
import { type ColorProps, PRIDE_PALLET, WHITE_PALLET, toRGB } from "./index.js";

const getPalletKey = (pallet: string[]) => pallet.join("-");

export default function ColorEditor(props: ColorProps & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
    const { onChange, value = {} as AnyColor, format, steps = [PRIDE_PALLET, WHITE_PALLET], minimal, ...rest } = props;
    const [currentColor, setCurrentColor] = useState<string>(toRGB(value, format));

    useEffect(() => {
        setCurrentColor(toRGB(value, format));
    }, [value, format]);

    return (
        <>
            {!minimal &&
                steps.map((pallet) => (
                    <div key={getPalletKey(pallet)} className="join me-2 float-start border">
                        {pallet.map((step) => (
                            <Button<string>
                                className="btn join-item"
                                style={{ backgroundColor: step }}
                                key={step}
                                item={step}
                                title={step}
                                onClick={(item) => onChange({ hex: item })}
                            >
                                &nbsp;&nbsp;&nbsp;
                            </Button>
                        ))}
                    </div>
                ))}

            <input
                type="color"
                className="form-control form-control-color"
                value={currentColor}
                style={{ minWidth: 40 }}
                onChange={(e) => {
                    if (e.target.value.toLowerCase() !== currentColor.toLowerCase()) {
                        onChange({ hex: e.target.value });
                    }
                }}
                {...rest}
            />
        </>
    );
}
