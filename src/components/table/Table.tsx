import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { type ChangeEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import Button from "../Button.js";
import TextFilter from "./TextFilter.js";

interface Props<T> {
    id: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    pageSizeStoreKey?: string;
    visibleColumns?: Record<string, boolean>;
}

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;

const PAGE_SIZES = [10, 30, 50, 100];

export default function Table<T>(props: Props<T>) {
    const { id, columns, data, pageSizeStoreKey, visibleColumns } = props;
    const { t } = useTranslation("common");
    const [columnVisibility] = useState<Record<string, boolean>>(visibleColumns ?? {});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
            columnVisibility,
        },
        initialState: {
            pagination: {
                pageIndex: 0, // custom initial page index
                pageSize: pageSizeStoreKey ? local.get(pageSizeStoreKey, 10) : 10, // custom default page size
            },
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // client side filtering
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // debugTable: false,
        // debugHeaders: false,
        // debugColumns: false,
        // debugCells: false,
        // debugRows: false,
        // debugAll: false,
    });
    const onPageSizeChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const newSize = Number(e.target.value);

            local.set(pageSizeStoreKey, newSize);
            table.setPageSize(newSize);
        },
        [pageSizeStoreKey, table.setPageSize],
    );

    return (
        <div className="overflow-x-auto">
            <table id={id} className="table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const sorting = header.column.getIsSorted();
                                const sortingText = sorting === "asc" ? " ↑" : sorting === "desc" ? " ↓" : null;

                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                                                <div
                                                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {sortingText}
                                                </div>
                                                {header.column.getCanFilter() ? (
                                                    <div className="mt-1">
                                                        <TextFilter
                                                            getFilterValue={header.column.getFilterValue}
                                                            setFilterValue={header.column.setFilterValue}
                                                        />
                                                    </div>
                                                ) : null}
                                            </>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-base-300">
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="divider" />
            <div className="navbar bg-base-100">
                <div className="navbar-start" />
                <div className="navbar-center join">
                    <Button className="btn btn-square join-item" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        <FontAwesomeIcon icon={faAnglesLeft} />
                    </Button>
                    <Button className="btn btn-square join-item" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </Button>
                    <Button className="btn join-item pointer-events-none">
                        {t("page")} {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </Button>
                    <Button className="btn btn-square join-item" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </Button>
                    <Button
                        className="btn btn-square join-item"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <FontAwesomeIcon icon={faAnglesRight} />
                    </Button>
                </div>
                <div className="navbar-end">
                    <select value={table.getState().pagination.pageSize} onChange={onPageSizeChange} className="select w-32 mx-1">
                        {PAGE_SIZES.map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {t("show")} {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
