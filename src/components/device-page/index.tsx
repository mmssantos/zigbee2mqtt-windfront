import { groupBy } from "lodash";
import type { CompositeFeature, Device, DeviceState, GenericFeature, Group, Scene } from "../../types.js";

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

    if (feature.type === "light") {
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
