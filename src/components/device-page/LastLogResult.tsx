import type { JSX } from "react";
import type { LogMessage } from "../../store.js";

export type LastLogResultProps = {
    logs: LogMessage[];
    filterFn: (l: LogMessage) => boolean;
};

export function LastLogResult(props: LastLogResultProps): JSX.Element {
    const { logs, filterFn } = props;
    const filtered = logs.filter(filterFn);
    const lastLogMessage = filtered.length > 0 ? filtered[filtered.length - 1] : null;
    const res: JSX.Element[] = [];
    if (lastLogMessage) {
        res.push(<div key="log" log={lastLogMessage} search={""} logLevel={"all"} />);
    }
    return <>{res}</>;
}
