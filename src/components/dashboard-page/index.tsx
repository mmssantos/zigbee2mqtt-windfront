import { type CompositeFeature, type DeviceState, FeatureAccessMode, type GenericFeature } from "../../types.js";

import groupBy from "lodash/groupBy.js";
import { isClimateFeature, isLightFeature } from "../device-page/index.js";

const GENERIC_RENDERER_IGNORED_NAMES = [
    "linkquality",
    "battery",
    "battery_low",
    "battery_state",
    "color_temp_startup",
    "voltage",
    "strength",
    "color_options",
    "warning",
    "position",
    "operation_mode",
    "operation_mode2",
    "programming_mode",
    "options",
    "programming",
    "schedule_monday",
    "schedule_tuesday",
    "schedule_wednesday",
    "schedule_thursday",
    "schedule_friday",
    "schedule_saturday",
    "schedule_sunday",
    "holiday_mode_date",
];

const WHITELIST_FEATURE_NAMES = ["state", "brightness", "color_temp", "mode", "sound", "occupancy", "tamper", "alarm", "action", "contact"];
const WHITELIST_FEATURE_TYPES = ["light"];

export const onlyValidFeaturesForDashboard = (
    feature: GenericFeature | CompositeFeature,
    deviceState: DeviceState = {} as DeviceState,
): GenericFeature | CompositeFeature | false => {
    const { access, property, name, type } = feature;
    let features: CompositeFeature["features"] = feature.features ?? [];

    if (isLightFeature(feature) || isClimateFeature(feature)) {
        const state = (property ? deviceState[property] : deviceState) as DeviceState;
        features = [];
        const validFeatures: GenericFeature[] = [];

        for (const subFeature of feature.features) {
            const validFeature = onlyValidFeaturesForDashboard(subFeature, state);

            if (validFeature) {
                validFeatures.push(validFeature);
            }
        }

        const groupedFeatures = groupBy(validFeatures, "property");

        for (const key in groupedFeatures) {
            features.push(groupedFeatures[key][0]);
        }
    }

    const filteredOutFeature = { ...feature, features };

    if (WHITELIST_FEATURE_NAMES.includes(name)) {
        return filteredOutFeature;
    }

    if (WHITELIST_FEATURE_TYPES.includes(type)) {
        return filteredOutFeature;
    }

    const stateProperty = deviceState[property];

    if (access && !(access & FeatureAccessMode.STATE && stateProperty != null && stateProperty !== "")) {
        return false;
    }

    if (name === "voltage" && deviceState.battery == null) {
        return filteredOutFeature;
    }

    if (GENERIC_RENDERER_IGNORED_NAMES.includes(name)) {
        return false;
    }

    if (access === FeatureAccessMode.STATE || access === FeatureAccessMode.STATE + FeatureAccessMode.GET) {
        return filteredOutFeature;
    }

    if (filteredOutFeature.features.length > 0) {
        return filteredOutFeature;
    }

    return false;
};
