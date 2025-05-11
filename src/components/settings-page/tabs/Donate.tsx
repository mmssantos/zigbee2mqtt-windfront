import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const DONATE_ROWS = [
    <div key="Nerivec" className="flex flex-row flex-wrap gap-3 items-center justify-items-center">
        <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/Nerivec" className="h-10">
            <img
                alt="Nerivec"
                crossOrigin="anonymous"
                src="https://img.buymeacoffee.com/button-api/?text=Thanks Nerivec&emoji=☕&slug=Nerivec&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                className="h-10"
            />
        </a>
        <a target="_blank" rel="noopener noreferrer" className="btn btn-secondary" href="https://github.com/sponsors/Nerivec">
            <FontAwesomeIcon icon={faHeart} />
            Sponsor Nerivec on Github
        </a>
    </div>,
    <div key="nurikk" className="flex flex-row flex-wrap gap-3 items-center justify-items-center">
        <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/nurikk" className="h-10">
            <img
                alt="nurikk"
                crossOrigin="anonymous"
                src="https://img.buymeacoffee.com/button-api/?text=Thanks Nurikk&emoji=🍺&slug=nurikk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                className="h-10"
            />
        </a>
    </div>,
    <div key="koenkk" className="flex flex-row flex-wrap gap-3 items-center justify-items-center">
        <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/koenkk" className="h-10">
            <img
                alt="koenkk"
                crossOrigin="anonymous"
                src="https://img.buymeacoffee.com/button-api/?text=Thanks Koenkk&emoji=☕&slug=koenkk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
                className="h-10"
            />
        </a>
        <a target="_blank" rel="noopener noreferrer" className="btn btn-secondary" href="https://github.com/sponsors/Koenkk">
            <FontAwesomeIcon icon={faHeart} />
            Sponsor Koenkk on Github
        </a>
    </div>,
];

export default function Donate() {
    const { t } = useTranslation("settings");

    return (
        <div className="flex flex-col gap-3 items-center">
            {t("donation_text")}
            {DONATE_ROWS.sort(() => Math.random() - 0.5)}
        </div>
    );
}
