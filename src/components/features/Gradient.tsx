import convertColors from "color-convert";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GradientFeature, RGBColor } from "../../types.js";
import Button from "../button/Button.js";
import ColorEditor from "../editors/ColorEditor.js";
import type { BaseFeatureProps } from "./index.js";

const hexToRGB = (hex: string): RGBColor => {
    hex = hex.replace("#", "");
    const bigint = Number.parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};

const rgbToHex = (rgb: RGBColor): string => {
    const { r, g, b } = rgb;
    return `#${convertColors.rgb.hex([r, g, b])}`;
};

type GradientProps = BaseFeatureProps<GradientFeature>;

export function Gradient(props: GradientProps) {
    const gradientColors = 5;
    const {
        minimal,
        onChange,
        feature: { length_min, length_max },
        deviceState,
    } = props;
    const { t } = useTranslation(["gradient", "common"]);
    const [colors, setColors] = useState<Array<RGBColor>>(Array(gradientColors).fill({ x: 0, y: 0 }));

    const setColor = (idx: number, hex: string) => {
        const c = [...colors];
        c[idx] = hexToRGB(hex);
        setColors(c);
    };

    const addColor = () => {
        const c = [...colors];
        c.push({ r: 255, g: 255, b: 255 });
        setColors(c);
    };

    const removeColor = (idx: number) => {
        const c = [...colors];
        c.splice(idx, 1);
        setColors(c);
    };

    useEffect(() => {
        const { gradient: inputGradient } = deviceState as { gradient: string[] };

        if (inputGradient && inputGradient.length > 0) {
            setColors(inputGradient.map(hexToRGB));
        }
    }, [deviceState]);

    const [canAdd, setCanAdd] = useState(false);
    const [canRemove, setCanRemove] = useState(false);

    useEffect(() => {
        setCanAdd(colors.length < length_max);
        setCanRemove(colors.length > length_min);
    }, [colors, length_min, length_max]);

    return (
        <div className="d-flex flex-column gap-1">
            {colors.map((color, idx) => (
                <div key={`${color.r}${color.g}${color.b}`} className="d-flex gap-2">
                    <ColorEditor
                        onChange={(ch) => {
                            setColor(idx, ch.hex as string);
                        }}
                        value={color}
                        format="color_rgb"
                    />
                    {canRemove && (
                        <Button<void> className="btn btn-error me-2" onClick={() => removeColor(idx)}>
                            -
                        </Button>
                    )}
                </div>
            ))}
            {canAdd && (
                <Button<void> className="btn btn-success me-2" onClick={addColor}>
                    +
                </Button>
            )}
            <div>
                <Button
                    className={`btn btn-primary float-end${minimal ? " btn-sm" : ""}`}
                    onClick={() => onChange({ gradient: colors.map(rgbToHex) })}
                >
                    {t("common:apply")}
                </Button>
            </div>
            ,
        </div>
    );
}
