import { groupBy } from "lodash";
import type { SceneId } from "../../actions/SceneApi.js";
import type {
    BinaryFeature,
    ClimateFeature,
    ColorFeature,
    CompositeFeature,
    CoverFeature,
    Device,
    DeviceState,
    EnumFeature,
    FanFeature,
    GenericExposedFeature,
    GradientFeature,
    Group,
    LightFeature,
    ListFeature,
    LockFeature,
    NumericFeature,
    Scene,
    SwitchFeature,
    TextualFeature,
} from "../../types.js";

import type { WithBridgeInfo } from "../../store.js";

export type TabName = "info" | "bind" | "state" | "exposes" | "clusters" | "reporting" | "settings" | "settings-specific" | "dev-console" | "scene";

export interface DeviceSettingsProps extends WithBridgeInfo {
    device: Device;
}

export type ParamValue = {
    key: string;
    value: unknown;
    type: unknown;
};

export type DeviceSettingsState = {
    newSetting: ParamValue;
    updatedDeviceConfig: Record<string, unknown> | Record<string, unknown>[];
};

export type DevicePageUrlParams = {
    dev: string;
    tab?: TabName;
};

export const isValidSceneId = (id: SceneId, existingScenes: Scene[] = []): boolean => {
    return id >= 0 && id <= 255 && !existingScenes.find((s) => s.id === id);
};

export function getScenes(target: Group | Device): Scene[] {
    if ((target as Device).endpoints) {
        const scenes: Scene[] = [];

        for (const key in (target as Device).endpoints) {
            const ep = (target as Device).endpoints[key];

            for (const scene of ep.scenes) {
                scenes.push({ ...scene });
            }
        }

        return scenes;
    }

    return (target as Group).scenes as Scene[];
}

const WHITELIST_FEATURE_NAMES = ["state", "color_temp", "color", "transition", "brightness"];

export function onlyValidFeaturesForScenes(
    feature: GenericExposedFeature | CompositeFeature,
    deviceState: DeviceState = {} as DeviceState,
): GenericExposedFeature | CompositeFeature | undefined {
    // eslint-disable-next-line prefer-const
    const { property, name } = feature as CompositeFeature;
    let features: CompositeFeature["features"] = "features" in feature ? feature.features : [];

    if (isLightFeature(feature)) {
        const state = (property ? deviceState[property] : deviceState) as DeviceState;
        features = [];
        const validFeatures: GenericExposedFeature[] = [];

        for (const subFeature of feature.features) {
            const validFeature = onlyValidFeaturesForScenes(subFeature, state);

            if (validFeature) {
                validFeatures.push(validFeature);
            }
        }

        const groupedFeatures = groupBy(validFeatures, "property");

        for (const key in groupedFeatures) {
            features.push(groupedFeatures[key][0]);
        }
    }

    if (WHITELIST_FEATURE_NAMES.includes(name) || features.length > 0) {
        return { ...feature, features } as GenericExposedFeature | CompositeFeature;
    }
}

export function isGenericExposedFeature(feature: GenericExposedFeature | CompositeFeature): feature is GenericExposedFeature {
    return !("features" in feature);
}

export function isBinaryFeature(feature: GenericExposedFeature | CompositeFeature): feature is BinaryFeature {
    return feature.type === "binary";
}

export function isListFeature(feature: GenericExposedFeature | CompositeFeature): feature is ListFeature {
    return feature.type === "list";
}

export function isNumericFeature(feature: GenericExposedFeature | CompositeFeature): feature is NumericFeature {
    return feature.type === "numeric";
}

export function isTextualFeature(feature: GenericExposedFeature | CompositeFeature): feature is TextualFeature {
    return feature.type === "text";
}

export function isEnumFeature(feature: GenericExposedFeature | CompositeFeature): feature is EnumFeature {
    return feature.type === "enum";
}

export function isLightFeature(feature: GenericExposedFeature | CompositeFeature): feature is LightFeature {
    return feature.type === "light";
}

export function isSwitchFeature(feature: GenericExposedFeature | CompositeFeature): feature is SwitchFeature {
    return feature.type === "switch";
}

export function isCoverFeature(feature: GenericExposedFeature | CompositeFeature): feature is CoverFeature {
    return feature.type === "cover";
}

export function isLockFeature(feature: GenericExposedFeature | CompositeFeature): feature is LockFeature {
    return feature.type === "lock";
}

export function isFanFeature(feature: GenericExposedFeature | CompositeFeature): feature is FanFeature {
    return feature.type === "fan";
}

export function isCompositeFeature(feature: GenericExposedFeature | CompositeFeature): feature is CompositeFeature {
    return feature.type === "composite" && feature.name !== "color_xy" && feature.name !== "color_hs";
}

export function isColorFeature(feature: GenericExposedFeature | CompositeFeature): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

export function isClimateFeature(feature: GenericExposedFeature | CompositeFeature): feature is ClimateFeature {
    return feature.type === "climate";
}

export function isGradientFeature(feature: GenericExposedFeature | CompositeFeature): feature is GradientFeature {
    return isListFeature(feature) && feature.name === "gradient" && feature.length_min !== null && feature.length_max !== null;
}
