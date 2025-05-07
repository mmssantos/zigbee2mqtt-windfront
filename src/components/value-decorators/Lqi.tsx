import { faSignal } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DisplayValue } from "./DisplayValue.js";

type LqiProps = {
    value: number | undefined;
};

export function Lqi({ value }: LqiProps) {
    let className = "";

    if (value) {
        if (value < 75) {
            className = "text-error";
        } else if (value < 125) {
            className = "text-warning";
        } else if (value > 200) {
            className = "text-success";
        }
    }

    return (
        <>
            <FontAwesomeIcon icon={faSignal} className={className} />{" "}
            <span className={className}>
                <DisplayValue value={value} name="linkquality" />
            </span>
        </>
    );
}
