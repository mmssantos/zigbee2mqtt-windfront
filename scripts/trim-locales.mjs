import { opendirSync, writeFileSync } from "node:fs";
import diff from "deep-diff";
import { set } from "lodash";

const isObject = (a) => !!a && a.constructor === Object;
function removeEmpty(obj) {
    return (
        Object.entries(obj)
            .filter(([_, v]) => v != null && v !== "")
            // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
            .reduce((acc, [k, v]) => ({ ...acc, [k]: isObject(v) ? removeEmpty(v) : v }), {})
    );
}

const enTranslationFile = "./src/i18n/locales/en.json";
const enTranslations = require(enTranslationFile);

const ignoredFiles = ["localeNames.json", "en.json"];
const localesDir = "./src/i18n/locales";
const files = [];
const dir = opendirSync(localesDir);
let dirent;
// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
while ((dirent = dir.readSync()) !== null) {
    if (!ignoredFiles.includes(dirent.name)) {
        files.push(dirent.name);
    }
}
dir.closeSync();

for (const file of files) {
    const localeFileName = `./src/i18n/locales/${file}`;
    const translations = require(localeFileName);
    const diffs = diff(enTranslations, translations);

    let newTranslation = {};

    for (const diff of diffs ?? []) {
        switch (diff.kind) {
            case "E":
                set(newTranslation, diff.path, diff.rhs);
                break;
        }
    }

    newTranslation = removeEmpty(newTranslation);
    console.log(`Trimmed ${localeFileName}`);
    writeFileSync(localeFileName, JSON.stringify(newTranslation, null, 4));
}
