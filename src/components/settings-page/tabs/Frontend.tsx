import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import LanguageSwitcher from "../../../i18n/LanguageSwitcher.js";
import {
    DEVICE_TABLE_PAGE_SIZE_KEY,
    GROUP_TABLE_PAGE_SIZE_KEY,
    HOMEPAGE_KEY,
    I18NEXTLNG_KEY,
    OTA_TABLE_PAGE_SIZE_KEY,
    THEME_KEY,
} from "../../../localStoreConsts.js";
import { ThemeSwitcher } from "../../ThemeSwitcher.js";
import Button from "../../button/Button.js";
import SelectField from "../../form-fields/SelectField.js";

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;

export default function Frontend() {
    const { t } = useTranslation(["settings", "navbar"]);
    const [homepage, setHomepage] = useState<string>(local.get(HOMEPAGE_KEY) || "devices");

    useEffect(() => {
        local.set(HOMEPAGE_KEY, homepage);
    }, [homepage]);

    const resetAll = () => {
        local.remove(DEVICE_TABLE_PAGE_SIZE_KEY);
        local.remove(OTA_TABLE_PAGE_SIZE_KEY);
        local.remove(GROUP_TABLE_PAGE_SIZE_KEY);
        local.remove(THEME_KEY);
        local.remove(HOMEPAGE_KEY);
        local.remove(I18NEXTLNG_KEY);

        window.location.reload();
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="alert alert-info alert-vertical sm:alert-horizontal mb-3">
                {t("frontend_notice")}
                <div>
                    <Button<void> className="btn btn-sm btn-error" onClick={resetAll}>
                        {t("reset_all")}
                    </Button>
                </div>
            </div>
            <div>
                {t("change_language")} <LanguageSwitcher useExistingChildren />
            </div>
            <div>
                {t("change_theme")} <ThemeSwitcher useExistingChildren />
            </div>
            <div>
                <SelectField name="homepage" label={t("set_homepage")} onChange={(e) => setHomepage(e.target.value)} defaultValue={homepage}>
                    <option value="devices">{t("navbar:devices")}</option>
                    <option value="dashboard">{t("navbar:dashboard")}</option>
                </SelectField>
            </div>
        </div>
    );
}
