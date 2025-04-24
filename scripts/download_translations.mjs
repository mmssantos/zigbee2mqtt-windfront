import { promises as fs } from "node:fs";
import { downloadLanguage, getAvaliableLanguages } from "./poeditor.mjs";

const locale2fileMap = {
    uk: "ua",
    "pt-br": "ptbr",
    "zh-Hans": "chs",
    "zh-TW": "zh",
};
async function main(projectId, apiToken) {
    const locales = await getAvaliableLanguages(projectId, apiToken);

    for (const locale of locales) {
        const exported = await downloadLanguage(projectId, apiToken, locale);
        const code = locale2fileMap[locale.code] || locale.code;
        if (code === "en") {
            console.log("Ignoring `en` translation");
        } else {
            await fs.writeFile(`./src/i18n/locales/${code}.json`, JSON.stringify(exported, null, 2));
        }
    }
}

const { POEDITOR_PROJECT_ID, POEDITOR_API_TOKEN } = process.env;
main(POEDITOR_PROJECT_ID, POEDITOR_API_TOKEN);
