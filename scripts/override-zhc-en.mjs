import { readFileSync, writeFileSync } from "node:fs";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import { prepareDefinition } from "zigbee-herdsman-converters";
import definitions from "zigbee-herdsman-converters/devices/index";

const EN_LOCALE_PATH = "./src/i18n/locales/en.json";

const enTranslations = JSON.parse(readFileSync(EN_LOCALE_PATH, "utf8"));
const featureDescriptions = {};
const featureNames = {};

const exportDescriptions = ({ features = [], description, name }) => {
    featureNames[name] = startCase(camelCase(name));
    featureDescriptions[description] = description;

    for (const feature of features) {
        exportDescriptions(feature);
    }
};

for (const definition of definitions.default) {
    const d = prepareDefinition(definition);
    const exposes = typeof d.exposes === "function" ? d.exposes(undefined, undefined) : d.exposes;

    exportDescriptions({ features: exposes });
}

enTranslations.featureDescriptions = featureDescriptions;
enTranslations.featureNames = featureNames;

writeFileSync(EN_LOCALE_PATH, JSON.stringify(enTranslations, null, 4), "utf8");
console.log("ZHC override written to:", EN_LOCALE_PATH);
