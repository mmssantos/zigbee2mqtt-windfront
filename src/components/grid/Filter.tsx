import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Column } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DebouncedInput } from "../form-fields/DebouncedInput.js";

// biome-ignore lint/suspicious/noExplicitAny: tmp
export function Filter({ column }: { column: Column<any, unknown> }) {
    const columnFilterValue = column.getFilterValue();
    const { filterVariant, rangeMin, rangeMax } = column.columnDef.meta ?? {};
    const { t } = useTranslation("common");

    return filterVariant === "range" ? (
        <div className="flex w-full flex-col lg:flex-row">
            <DebouncedInput
                type="number"
                value={(columnFilterValue as [number, number])?.[0] ?? ""}
                onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
                placeholder={t("min")}
                min={rangeMin}
                max={rangeMax !== undefined ? rangeMax - 1 : undefined}
                className="input input-xs w-8 grid grow place-items-center"
            />
            <DebouncedInput
                type="number"
                value={(columnFilterValue as [number, number])?.[1] ?? ""}
                onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
                placeholder={t("max")}
                min={rangeMin !== undefined ? rangeMin + 1 : undefined}
                max={rangeMax}
                className="input input-xs w-8 grid grow place-items-center ml-1"
            />
        </div>
    ) : (
        // biome-ignore lint/a11y/noLabelWithoutControl: wrapped input
        <label className="input input-xs w-32">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <DebouncedInput
                className=""
                type="search"
                onChange={(value) => column.setFilterValue(value)}
                placeholder={t("enter_search_criteria")}
                value={(columnFilterValue ?? "") as string}
            />
        </label>
        // See faceted column filters example for datalist search suggestions
    );
}
