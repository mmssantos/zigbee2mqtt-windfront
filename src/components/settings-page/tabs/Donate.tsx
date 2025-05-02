import { useTranslation } from "react-i18next";

const DONATE_ROWS = [
    <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/Nerivec" className="w-50 h-12" key="Nerivec">
        <img
            alt="Nerivec"
            crossOrigin="anonymous"
            src="https://img.buymeacoffee.com/button-api/?text=Thanks Nerivec&emoji=☕&slug=Nerivec&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
        />
    </a>,
    <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/nurikk" className="w-50 h-12" key="nurikk">
        <img
            alt="nurikk"
            crossOrigin="anonymous"
            src="https://img.buymeacoffee.com/button-api/?text=Thanks Nurikk&emoji=🍺&slug=nurikk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
        />
    </a>,
    <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/koenkk" className="w-50 h-12" key="koenkk">
        <img
            alt="koenkk"
            crossOrigin="anonymous"
            src="https://img.buymeacoffee.com/button-api/?text=Thanks Koenkk&emoji=☕&slug=koenkk&button_colour=FFDD00&font_colour=000000&font_family=Arial&outline_colour=000000&coffee_colour=ffffff"
        />
    </a>,
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
