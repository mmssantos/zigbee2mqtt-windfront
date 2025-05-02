import type { Resource } from "i18next";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import bg from "./flags/bg.png";
import ca from "./flags/ca.png";
import chs from "./flags/cn.png";
import cs from "./flags/cz.png";
import da from "./flags/da.png";
import de from "./flags/de.png";
import es from "./flags/es.png";
import eu from "./flags/eu.png";
import fi from "./flags/fi.png";
import fr from "./flags/fr.png";
import hu from "./flags/hu.png";
import it from "./flags/it.png";
import ko from "./flags/kr.png";
import missing from "./flags/missing-locale.png";
import nl from "./flags/nl.png";
import no from "./flags/no.png";
import pl from "./flags/pl.png";
import ptbr from "./flags/ptbr.png";
import ru from "./flags/ru.png";
import sv from "./flags/sv.png";
import tr from "./flags/tr.png";
import zh from "./flags/tw.png";
import ua from "./flags/ua.png";
import en from "./flags/uk.png";

import { PopoverDropdown } from "../components/dropdown/PopoverDropdown.js";
import localeNames from "./locales/localeNames.json" with { type: "json" };

const LOCALES_MAP = {
    ca,
    en,
    fr,
    pl,
    de,
    ru,
    ptbr,
    es,
    ua,
    "zh-CN": chs,
    nl,
    it,
    zh,
    ko,
    cs,
    fi,
    sv,
    tr,
    no,
    da,
    bg,
    hu,
    eu,
};

export default function LanguageSwitcher({ useExistingChildren }: { useExistingChildren?: true }): JSX.Element {
    const { i18n } = useTranslation("localeNames");
    const currentLanguage = LOCALES_MAP[i18n.language] ? i18n.language : i18n.language.split("-")[0];

    return (
        <PopoverDropdown
            name="locale-picker"
            buttonChildren={<img src={LOCALES_MAP[currentLanguage] ?? missing} alt={localeNames[currentLanguage]} style={{ maxWidth: "80%" }} />}
            dropdownStyle="dropdown-end"
        >
            {!useExistingChildren &&
                Object.keys(i18n.options.resources as Resource).map((language) => (
                    <li
                        key={language}
                        onClick={async () => await i18n.changeLanguage(language)}
                        onKeyUp={async (e) => {
                            if (e.key === "enter") {
                                await i18n.changeLanguage(language);
                            }
                        }}
                    >
                        <span className="btn btn-block btn-ghost">{localeNames[language]}</span>
                    </li>
                ))}
        </PopoverDropdown>
    );
}
