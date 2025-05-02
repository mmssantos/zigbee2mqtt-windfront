import convertColors from "color-convert";
import type { AnyColor, ColorFormat, HueSaturationColor, RGBColor, XYColor } from "../../types.js";

export const toRGB = (source: AnyColor, sourceFormat: ColorFormat): string => {
    switch (sourceFormat) {
        case "color_xy": {
            const { x = 0, y = 0 } = source as XYColor;
            const z = 1.0 - x - y;
            const Y = 1;
            const X = (Y / y) * x;
            const Z = (Y / y) * z;
            return `#${convertColors.xyz.hex([X * 100.0, Y * 100.0, Z * 100.0])}`;
        }

        case "color_hs": {
            const { hue = 0, saturation = 0 } = source as HueSaturationColor;
            return `#${convertColors.hsv.hex([hue, saturation, 100])}`;
        }

        case "color_rgb": {
            const { r, g, b } = source as RGBColor;
            return `#${convertColors.rgb.hex([r, g, b])}`;
        }

        default:
            return "#FFFFFF";
    }
};
