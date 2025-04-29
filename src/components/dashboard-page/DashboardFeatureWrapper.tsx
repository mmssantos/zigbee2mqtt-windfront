import {
    type IconDefinition,
    faA,
    faArrowsLeftRightToLine,
    faAtom,
    faBolt,
    faCalendarDay,
    faCalendarWeek,
    faCheck,
    faCloudDownloadAlt,
    faCopyright,
    faCube,
    faDoorClosed,
    faDoorOpen,
    faExclamationCircle,
    faExclamationTriangle,
    faFillDrip,
    faGear,
    faIndustry,
    faPalette,
    faPercent,
    faPersonRays,
    faPlane,
    faPlug,
    faPlugCircleXmark,
    faPowerOff,
    faRadiation,
    faRadiationAlt,
    faSlidersH,
    faSmoking,
    faStarHalfAlt,
    faSun,
    faThermometerEmpty,
    faThermometerFull,
    faThermometerHalf,
    faThermometerQuarter,
    faThermometerThreeQuarters,
    faTint,
    faTriangleExclamation,
    faTurnUp,
    faUserCog,
    faVolumeUp,
    faWalking,
    faWarehouse,
    faWater,
    faWaveSquare,
    faX,
    faY,
    faZ,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";

type FaIconFlip = "horizontal" | "vertical" | "both";
type TemperatureUnit = "°C" | "°F";

const TYPE_TO_CLASS_MAP: Record<string, [IconDefinition, { className?: string; flip?: FaIconFlip; rotate?: number }]> = {
    humidity: [faTint, { className: "text-info" }],
    illuminance: [faSun, {}],
    pressure: [faCloudDownloadAlt, {}],
    co2: [faAtom, { className: "text-warning" }],
    voltage: [faBolt, { className: "text-success" }],
    state: [faStarHalfAlt, {}],
    brightness: [faSun, {}],
    occupancy: [faWalking, {}],
    presence: [faPersonRays, {}],
    current: [faCopyright, { className: "text-warning" }],
    power: [faPowerOff, { className: "text-success" }],
    energy: [faPlug, { className: "text-info" }],
    frequency: [faWaveSquare, {}],
    tamper: [faExclamationCircle, { className: "text-error" }],
    smoke: [faSmoking, { className: "text-error" }],
    radiation_dose_per_hour: [faRadiation, { className: "text-error" }],
    radioactive_events_per_minute: [faRadiationAlt, { className: "text-warning" }],
    power_factor: [faIndustry, { className: "text-error" }],
    mode: [faUserCog, { className: "text-warning" }],
    sound: [faVolumeUp, { className: "text-info" }],
    position: [faPercent, { className: "text-info" }],
    alarm: [faExclamationTriangle, { className: "text-error" }],
    color_xy: [faPalette, {}],
    color_hs: [faPalette, {}],
    color_temp: [faSlidersH, {}],
    illuminance_lux: [faSun, {}],
    soil_moisture: [faFillDrip, {}],
    water_leak: [faWater, {}],
    week: [faCalendarWeek, {}],
    workdays_schedule: [faCalendarDay, { className: "text-info" }],
    holidays_schedule: [faCalendarDay, { className: "text-error" }],
    away_mode: [faPlane, { className: "text-info" }],
    vibration: [faWater, { rotate: 270 }],
    power_outage_count: [faPlugCircleXmark, {}],
    action: [faA, {}],
    angle_x: [faX, {}],
    angle_y: [faY, {}],
    angle_z: [faZ, {}],
    side: [faCube, {}],
    humidity_alarm: [faTriangleExclamation, {}],
    temperature_alarm: [faTriangleExclamation, {}],
    approach_distance: [faArrowsLeftRightToLine, { className: "text-warning" }],
    distance: [faArrowsLeftRightToLine, { className: "text-warning" }],
    trigger_count: [faTurnUp, { className: "text-info", flip: "horizontal" }],
    level_config: [faGear, {}],
    station: [faWarehouse, {}],
    test: [faCheck, { className: "text-success" }],
};

const getTemperatureIcon = (temperature: number, unit?: TemperatureUnit) => {
    let icon = faThermometerEmpty;

    if (unit === "°F") {
        temperature = (temperature - 32) / 1.8;
    }

    if (temperature >= 30) {
        icon = faThermometerFull;
    } else if (temperature >= 25) {
        icon = faThermometerThreeQuarters;
    } else if (temperature >= 20) {
        icon = faThermometerHalf;
    } else if (temperature >= 15) {
        icon = faThermometerQuarter;
    }

    return icon;
};

const getGenericFeatureIcon = (name: string, value: unknown, unit?: unknown): [IconDefinition, string, Record<string, unknown>] | undefined => {
    let icon: IconDefinition | undefined;
    const classes: string[] = [];
    const spec: Record<string, unknown> = {};

    switch (name) {
        case "device_temperature":
        case "temperature":
        case "local_temperature":
            icon = getTemperatureIcon(value as number, unit as TemperatureUnit);
            classes.push("text-error");
            break;
        case "contact":
            icon = value ? faDoorClosed : faDoorOpen;
            if (!value) {
                classes.push("text-primary");
                spec.flip = true;
            }
            break;
        case "occupancy":
            if (value) {
                classes.push("text-warning");
                spec.beat = true;
            }
            break;
        case "presence":
            if (value) {
                classes.push("text-warning");
                spec.beat = true;
            }
            break;
        case "tamper":
            if (value) {
                spec.beatFade = true;
                spec.shake = true;
            }
            break;
        case "water_leak":
            if (value) {
                classes.push("text-primary");
                spec.beatFade = true;
            }
            break;
        case "vibration":
            if (value) {
                classes.push("text-primary");
                spec.shake = true;
            }
            break;
        default:
            break;
    }

    if (icon) {
        return [icon, classes.join(" "), spec];
    }

    const mappedType = TYPE_TO_CLASS_MAP[name] ?? [undefined, {}];
    icon = mappedType[0];
    const mappedSpec = mappedType[1];

    if (mappedSpec.className) {
        classes.push(mappedSpec.className);
    }

    if (!icon) {
        classes.push("invisible");
    }

    return icon ? [icon, classes.join(" "), { flip: mappedSpec.flip, rotate: mappedSpec.rotate, ...spec }] : undefined;
};

export default function DashboardFeatureWrapper(props: PropsWithChildren<FeatureWrapperProps>) {
    const { children, feature, deviceState = {} } = props;
    const fi = useMemo(
        () => getGenericFeatureIcon(feature.name, deviceState[feature.property!], "unit" in feature ? feature.unit : undefined),
        [feature, deviceState],
    );
    const { t } = useTranslation(["featureNames"]);
    const featureName = feature.name === "state" ? feature.property : feature.name;
    const fallbackFeatureName = startCase(camelCase(featureName));

    return (
        <div className="flex flex-row items-center gap-1">
            {fi && <FontAwesomeIcon icon={fi[0]} fixedWidth className={fi[1]} {...fi[2]} />}
            <div className="flex-grow-1">
                {t(featureName!, { defaultValue: fallbackFeatureName })}
                {feature.endpoint ? ` (${feature.endpoint})` : null}
            </div>
            <div className="flex-shrink-1">{children}</div>
        </div>
    );
}
