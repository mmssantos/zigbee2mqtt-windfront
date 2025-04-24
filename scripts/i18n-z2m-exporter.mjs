import { writeFileSync } from "node:fs";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import { devices } from "zigbee-herdsman-converters";
import settingsSchema from "../../zigbee2mqtt/lib/util/settings.schema.json";

const featureDescriptions = {};
const featureNames = {};

const exportDescriptions = ({ features = [], description, name }) => {
    featureNames[name] = startCase(camelCase(name));
    featureDescriptions[description] = description;
    if (Array.isArray(features)) {
        for (const feature of features) {
            exportDescriptions(feature);
        }
    } else {
        for (const feature of features()) {
            exportDescriptions(feature);
        }
    }
};

for (const device of devices) {
    exportDescriptions({ features: device.exposes });
}

const enTranslationFile = "./src/i18n/locales/en.json";
const enTranslations = require(enTranslationFile);

const settingsSchemaDescriptions = {};
const settingsSchemaTitles = {};
const isObject = (value) => value !== null && typeof value === "object";

const exportSettingsSchemaDescriptions = (obj) => {
    for (const key in obj) {
        const value = obj[key];

        if (isObject(value)) {
            exportSettingsSchemaDescriptions(value);
        } else if (key === "description") {
            settingsSchemaDescriptions[value] = value;
        } else if (key === "title") {
            settingsSchemaTitles[value] = value;
        }
    }
};

exportSettingsSchemaDescriptions(settingsSchema);

enTranslations.featureDescriptions = featureDescriptions;
enTranslations.featureNames = featureNames;
enTranslations.settingsSchemaDescriptions = settingsSchemaDescriptions;
enTranslations.settingsSchemaTitles = settingsSchemaTitles;

writeFileSync(enTranslationFile, JSON.stringify(enTranslations, null, 4));
