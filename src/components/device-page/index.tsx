import { groupBy } from "lodash";
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
    GenericFeature,
    GradientFeature,
    Group,
    LightFeature,
    ListFeature,
    LockFeature,
    NumericFeature,
    Scene,
    SwitchFeature,
    TextFeature,
} from "../../types.js";

import { isDevice } from "../../utils.js";

export const isValidSceneId = (id: number, existingScenes: Scene[] = []): boolean => {
    return id >= 0 && id <= 255 && !existingScenes.find((s) => s.id === id);
};

export function getScenes(target: Group | Device): Scene[] {
    if (isDevice(target)) {
        const scenes: Scene[] = [];

        for (const key in target.endpoints) {
            const ep = target.endpoints[key];

            for (const scene of ep.scenes) {
                scenes.push({ ...scene });
            }
        }

        return scenes;
    }

    return (target as Group).scenes as Scene[];
}

const WHITELIST_FEATURE_NAMES = ["state", "color_temp", "color", "transition", "brightness"];

export function getScenesFeatures(
    feature: GenericFeature | CompositeFeature,
    deviceState: DeviceState = {} as DeviceState,
): GenericFeature | CompositeFeature | undefined {
    // eslint-disable-next-line prefer-const
    const { property, name } = feature as CompositeFeature;
    let features: CompositeFeature["features"] = feature.features ?? [];

    if (isLightFeature(feature)) {
        const state = (property ? deviceState[property] : deviceState) as DeviceState;
        features = [];
        const validFeatures: GenericFeature[] = [];

        for (const subFeature of feature.features) {
            const validFeature = getScenesFeatures(subFeature, state);

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
        return { ...feature, features } as GenericFeature | CompositeFeature;
    }
}

export function isGenericExposedFeature(feature: GenericFeature | CompositeFeature): feature is GenericFeature {
    return !("features" in feature);
}

export function isCompositeFeature(feature: GenericFeature | CompositeFeature): feature is CompositeFeature {
    return feature.type === "composite";
}

export function isBinaryFeature(feature: GenericFeature | CompositeFeature): feature is BinaryFeature {
    return feature.type === "binary";
}

export function isListFeature(feature: GenericFeature | CompositeFeature): feature is ListFeature {
    return feature.type === "list";
}

export function isNumericFeature(feature: GenericFeature | CompositeFeature): feature is NumericFeature {
    return feature.type === "numeric";
}

export function isTextFeature(feature: GenericFeature | CompositeFeature): feature is TextFeature {
    return feature.type === "text";
}

export function isEnumFeature(feature: GenericFeature | CompositeFeature): feature is EnumFeature {
    return feature.type === "enum";
}

export function isLightFeature(feature: GenericFeature | CompositeFeature): feature is LightFeature {
    return feature.type === "light";
}

export function isSwitchFeature(feature: GenericFeature | CompositeFeature): feature is SwitchFeature {
    return feature.type === "switch";
}

export function isCoverFeature(feature: GenericFeature | CompositeFeature): feature is CoverFeature {
    return feature.type === "cover";
}

export function isLockFeature(feature: GenericFeature | CompositeFeature): feature is LockFeature {
    return feature.type === "lock";
}

export function isFanFeature(feature: GenericFeature | CompositeFeature): feature is FanFeature {
    return feature.type === "fan";
}

export function isClimateFeature(feature: GenericFeature | CompositeFeature): feature is ClimateFeature {
    return feature.type === "climate";
}

export function isColorFeature(feature: GenericFeature | CompositeFeature): feature is ColorFeature {
    return feature.type === "composite" && (feature.name === "color_xy" || feature.name === "color_hs");
}

export function isGradientFeature(feature: GenericFeature | CompositeFeature): feature is GradientFeature {
    return isListFeature(feature) && feature.name === "gradient" && feature.length_min != null && feature.length_max != null;
}
