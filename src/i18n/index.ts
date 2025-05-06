import i18n, { type ResourceLanguage } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { register } from "timeago.js";
import timeBg from "timeago.js/lib/lang/bg.js";
import timeCa from "timeago.js/lib/lang/ca.js";
import timeCs from "timeago.js/lib/lang/cs.js";
import timeDa from "timeago.js/lib/lang/da.js";
import timeDe from "timeago.js/lib/lang/de.js";
import timeEs from "timeago.js/lib/lang/es.js";
import timeEu from "timeago.js/lib/lang/eu.js";
import timeFi from "timeago.js/lib/lang/fi.js";
import timeFR from "timeago.js/lib/lang/fr.js";
import timeHu from "timeago.js/lib/lang/hu.js";
import timeIt from "timeago.js/lib/lang/it.js";
import timeKo from "timeago.js/lib/lang/ko.js";
import timeNo from "timeago.js/lib/lang/nb_NO.js";
import timeNl from "timeago.js/lib/lang/nl.js";
import timePl from "timeago.js/lib/lang/pl.js";
import timePtBr from "timeago.js/lib/lang/pt_BR.js";
import timeRu from "timeago.js/lib/lang/ru.js";
import timeSv from "timeago.js/lib/lang/sv.js";
import timeTr from "timeago.js/lib/lang/tr.js";
import timeUa from "timeago.js/lib/lang/uk.js";
import timeChs from "timeago.js/lib/lang/zh_CN.js";
import timeZh from "timeago.js/lib/lang/zh_TW.js";
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

register("bg", timeBg as unknown as typeof timeBg.default);
register("ca", timeCa as unknown as typeof timeCa.default);
register("cs", timeCs as unknown as typeof timeCs.default);
register("da", timeDa as unknown as typeof timeDa.default);
register("de", timeDe as unknown as typeof timeDe.default);
register("es", timeEs as unknown as typeof timeEs.default);
register("eu", timeEu as unknown as typeof timeEu.default);
register("fi", timeFi as unknown as typeof timeFi.default);
register("fr", timeFR as unknown as typeof timeFR.default);
register("hu", timeHu as unknown as typeof timeHu.default);
register("it", timeIt as unknown as typeof timeIt.default);
register("ko", timeKo as unknown as typeof timeKo.default);
register("nl", timeNl as unknown as typeof timeNl.default);
register("no", timeNo as unknown as typeof timeNo.default);
register("pl", timePl as unknown as typeof timePl.default);
register("ptbr", timePtBr as unknown as typeof timePtBr.default);
register("ru", timeRu as unknown as typeof timeRu.default);
register("sv", timeSv as unknown as typeof timeSv.default);
register("tr", timeTr as unknown as typeof timeTr.default);
register("ua", timeUa as unknown as typeof timeUa.default);
register("zh-CN", timeChs as unknown as typeof timeChs.default);
register("zh", timeZh as unknown as typeof timeZh.default);

const resources = {
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
