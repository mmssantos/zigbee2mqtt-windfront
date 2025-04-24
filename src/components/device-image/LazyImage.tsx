import { useImage } from "react-image";
import type { Device } from "../../types.js";
import { AVAILABLE_GENERATORS } from "./index.js";

type LazyImageProps =
    | {
          type: "svg";
          device: Device;
          width?: number;
          height?: number;
      }
    | {
          type: "img";
          device: Device;
          className?: string;
      };

export function LazyImage(props: Readonly<LazyImageProps>) {
    const { device, type, ...rest } = props;

    const { src } = useImage({
        srcList: AVAILABLE_GENERATORS.map((fn) => fn(device)).filter(Boolean) as string[],
    });

    if (type === "svg") {
        return <image crossOrigin={"anonymous"} {...rest} href={src} />;
    }

    // biome-ignore lint/a11y/useAltText: bad detection
    return <img alt={device.ieee_address} crossOrigin={"anonymous"} src={src} {...rest} />;
}
