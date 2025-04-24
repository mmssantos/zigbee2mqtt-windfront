import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    type ColumnDef,
    type ColumnFiltersState,
    type RowData,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import store2 from "store2";
import Button from "../button/Button.js";
import { Filter } from "./Filter.js";

declare module "@tanstack/react-table" {
    // allows us to define custom properties for our columns
    // biome-ignore lint/correctness/noUnusedVariables: bad detection
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: "text" | "range";
        rangeMin?: number;
        rangeMax?: number;
    }
}

interface Props {
    id: string;
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    columns: ColumnDef<any, any>[];
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    data: any[];
    pageSizeStoreKey?: string;
}

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;

export const Table: React.FC<Props> = ({ id, columns, data, pageSizeStoreKey }) => {
    const { t } = useTranslation("common");
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
        },
        initialState: {
            pagination: {
                pageIndex: 0, // custom initial page index
                pageSize: pageSizeStoreKey ? (local.get(pageSizeStoreKey) ?? 10) : 10, // custom default page size
            },
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), //client side filtering
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // debugTable: true,
        // debugHeaders: true,
        // debugColumns: false,
    });

    return (
        <div className="overflow-x-auto">
            <table id={id} className="table">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <>
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort() ? "cursor-pointer select-none" : "",
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: " ↑",
                                                        desc: " ↓",
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                                {header.column.getCanFilter() ? (
                                                    <div className="mt-1">
                                                        <Filter column={header.column} />
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
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <tr key={row.id} className="hover:bg-base-300">
                                {row.getVisibleCells().map((cell) => {
                                    return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="divider" />
            <div className="navbar bg-base-100 shadow-sm">
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
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            const newSize = Number(e.target.value);

                            local.set(pageSizeStoreKey, newSize);
                            table.setPageSize(newSize);
                        }}
                        className="select w-32 mx-1"
                    >
                        {[10, 30, 50, 100].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {t("show")} {pageSize}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
