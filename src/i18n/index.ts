import i18n, { type ResourceLanguage } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { register } from "timeago.js";
import bgTranslations from "./locales/bg.json" with { type: "json" };
import caTranslations from "./locales/ca.json" with { type: "json" };
import chsTranslations from "./locales/chs.json" with { type: "json" };
import csTranslations from "./locales/cs.json" with { type: "json" };
import daTranslations from "./locales/da.json" with { type: "json" };
import deTranslations from "./locales/de.json" with { type: "json" };
import enTranslations from "./locales/en.json" with { type: "json" };
import esTranslations from "./locales/es.json" with { type: "json" };
import euTranslations from "./locales/eu.json" with { type: "json" };
import fiTranslations from "./locales/fi.json" with { type: "json" };
import frTranslations from "./locales/fr.json" with { type: "json" };
import huTranslations from "./locales/hu.json" with { type: "json" };
import itTranslations from "./locales/it.json" with { type: "json" };
import koTranslations from "./locales/ko.json" with { type: "json" };
import nlTranslations from "./locales/nl.json" with { type: "json" };
import noTranslations from "./locales/no.json" with { type: "json" };
import plTranslations from "./locales/pl.json" with { type: "json" };
import ptbrTranslations from "./locales/ptbr.json" with { type: "json" };
import ruTranslations from "./locales/ru.json" with { type: "json" };
import svTranslations from "./locales/sv.json" with { type: "json" };
import trTranslations from "./locales/tr.json" with { type: "json" };
import uaTranslations from "./locales/ua.json" with { type: "json" };
import zhTranslations from "./locales/zh.json" with { type: "json" };

import timeBg from "timeago.js/lib/lang/bg";
import timeCa from "timeago.js/lib/lang/ca";
import timeCs from "timeago.js/lib/lang/cs";
import timeDa from "timeago.js/lib/lang/da";
import timeDe from "timeago.js/lib/lang/de";
import timeEs from "timeago.js/lib/lang/es";
import timeEu from "timeago.js/lib/lang/eu";
import timeFi from "timeago.js/lib/lang/fi";
import timeFR from "timeago.js/lib/lang/fr";
import timeHu from "timeago.js/lib/lang/hu";
import timeIt from "timeago.js/lib/lang/it";
import timeKo from "timeago.js/lib/lang/ko";
import timeNo from "timeago.js/lib/lang/nb_NO";
import timeNl from "timeago.js/lib/lang/nl";
import timePl from "timeago.js/lib/lang/pl";
import timePtBr from "timeago.js/lib/lang/pt_BR";
import timeRu from "timeago.js/lib/lang/ru";
import timeSv from "timeago.js/lib/lang/sv";
import timeTr from "timeago.js/lib/lang/tr";
import timeUa from "timeago.js/lib/lang/uk";
import timeChs from "timeago.js/lib/lang/zh_CN";
import timeZh from "timeago.js/lib/lang/zh_TW";

register("ca", timeCa);
register("pl", timePl);
register("fr", timeFR);
register("de", timeDe);
register("ru", timeRu);
register("ptbr", timePtBr);
register("es", timeEs);
register("ua", timeUa);
register("zh-CN", timeChs);
register("nl", timeNl);
register("it", timeIt);
register("ko", timeKo);
register("zh", timeZh);
register("cs", timeCs);
register("fi", timeFi);
register("sv", timeSv);
register("tr", timeTr);
register("no", timeNo);
register("da", timeDa);
register("bg", timeBg);
register("hu", timeHu);
register("eu", timeEu);

export const resources = {
    ca: caTranslations as ResourceLanguage,
    en: enTranslations as ResourceLanguage,
    fr: frTranslations as ResourceLanguage,
    pl: plTranslations as ResourceLanguage,
    de: deTranslations as ResourceLanguage,
    ru: ruTranslations as ResourceLanguage,
    ptbr: ptbrTranslations as ResourceLanguage,
    es: esTranslations as ResourceLanguage,
    ua: uaTranslations as ResourceLanguage,
    "zh-CN": chsTranslations as ResourceLanguage,
    nl: nlTranslations as ResourceLanguage,
    it: itTranslations as ResourceLanguage,
    zh: zhTranslations as ResourceLanguage,
    ko: koTranslations as ResourceLanguage,
    cs: csTranslations as ResourceLanguage,
    fi: fiTranslations as ResourceLanguage,
    sv: svTranslations as ResourceLanguage,
    tr: trTranslations as ResourceLanguage,
    no: noTranslations as ResourceLanguage,
    da: daTranslations as ResourceLanguage,
    bg: bgTranslations as ResourceLanguage,
    hu: huTranslations as ResourceLanguage,
    eu: euTranslations as ResourceLanguage,
} as const;

const debug = process.env.NODE_ENV !== "production";
i18n.on("languageChanged", (lng: string) => {
    document.documentElement.lang = lng;
});
i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        debug,
        resources,
        ns: Object.keys(enTranslations),
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

const currentLanguage = i18n.language.split("-")[0].toLocaleLowerCase();
if (!resources[currentLanguage]) {
    i18n.changeLanguage("en");
}
export default i18n;
