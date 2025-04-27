import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Form from "@rjsf/core";
import Validator from "@rjsf/validator-ajv8";
import { type JSX, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/button/Button.js";
import DebouncedInput from "../components/form-fields/DebouncedInput.js";
import SelectField from "../components/form-fields/SelectField.js";
import { LEVEL_CMAP, LOG_LEVELS, LOG_LIMITS } from "../consts.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { clearLogs as clearStateLogs, setLogsLimit } from "../store.js";
import { formatDate } from "../utils.js";

// XXX: workaround typing
const FormTyped = Form as unknown as typeof Form.default;
const ValidatorTyped = Validator as unknown as typeof Validator.default;

export default function LogsPage() {
    const [filterValue, setFilterValue] = useState<string>("");
    const [logLevel, setLogLevel] = useState<string>("all");
    const [highlightOnly, setHighlightOnly] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const bridgeInfo = useAppSelector((state) => state.bridgeInfo);
    const logsLimit = useAppSelector((state) => state.logsLimit);
    const { t } = useTranslation("logs");
    const logs = useAppSelector((state) => state.logs);
    const filteredLogs = logs
        .filter(
            (l) =>
                (logLevel === "all" || l.level === logLevel) &&
                (highlightOnly || !filterValue || l.message.toLowerCase().includes(filterValue.toLowerCase())),
        )
        .sort();

    const renderSearch = (): JSX.Element => (
        <div className="flex flex-row flex-wrap gap-3 items-top">
            <SelectField name="log_level" label={t("show_only")} value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                {LOG_LEVELS.map((level) => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </SelectField>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">{t("filter_by_text")}</legend>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: wrapped input */}
                <label className="input w-64">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <DebouncedInput
                        className=""
                        type="search"
                        onChange={(value) => setFilterValue(value.toString())}
                        placeholder={t("common:enter_search_criteria")}
                        value={filterValue}
                        disabled={filteredLogs.length === 0}
                    />
                    <kbd
                        className="kbd kbd-sm cursor-pointer"
                        onClick={() => setFilterValue("")}
                        onKeyUp={(e) => {
                            if (e.key === "enter") {
                                setFilterValue("");
                            }
                        }}
                        title={t("common:clear")}
                    >
                        x
                    </kbd>
                </label>
            </fieldset>
            <label className="label text-xs">
                <input type="checkbox" className="checkbox" defaultChecked={highlightOnly} onChange={(e) => setHighlightOnly(e.target.checked)} />
                {t("highlight_only")}
            </label>
            <SelectField
                name="log_limit"
                label={t("logs_limit")}
                onChange={(e) => {
                    dispatch(setLogsLimit(Number.parseInt(e.target.value)));
                }}
                value={logsLimit}
            >
                {LOG_LIMITS.map((limit) => (
                    <option key={limit} value={limit}>
                        {limit}
                    </option>
                ))}
            </SelectField>
            <Button onClick={() => dispatch(clearStateLogs())} className="btn btn-primary self-center" disabled={filteredLogs.length === 0}>
                {t("common:clear")}
            </Button>
            <FormTyped
                schema={bridgeInfo.config_schema.properties.advanced?.properties?.log_level || {}}
                formData={bridgeInfo.config.advanced.log_level}
                onChange={async (params) => await sendMessage("bridge/request/options", { options: { advanced: { log_level: params.formData } } })}
                validator={ValidatorTyped}
            />
        </div>
    );

    const highlighted = useCallback(
        (message: string) => {
            return filterValue && message.toLowerCase().includes(filterValue.toLowerCase()) ? "bg-accent text-accent-content" : "";
        },
        [filterValue],
    );

    return (
        <>
            {renderSearch()}
            <div className="mockup-code w-full">
                {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                        <pre key={log.timestamp} data-prefix={idx} className={`${LEVEL_CMAP[log.level]} ${highlighted(log.message)}`}>
                            <code>
                                [{log.timestamp}] {log.message}
                            </code>
                        </pre>
                    ))
                ) : (
                    <pre data-prefix="~">
                        <code>
                            [{formatDate(new Date())}] {t("empty_logs_message")}
                        </code>
                    </pre>
                )}
            </div>
        </>
    );
}
