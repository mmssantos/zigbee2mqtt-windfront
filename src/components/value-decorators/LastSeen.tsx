import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { format } from "timeago.js";
import type { LastSeenConfig } from "../../types.js";
import { convertLastSeenToDate, formatDate } from "../../utils.js";

type LastSeenProps = {
    lastSeen: unknown;
    config: LastSeenConfig;
};

export function LastSeen({ lastSeen, config }: LastSeenProps): JSX.Element {
    const { i18n } = useTranslation();
    const lastSeenDate = convertLastSeenToDate(lastSeen, config);

    return lastSeenDate ? <span title={formatDate(lastSeenDate)}>{format(lastSeenDate, i18n.language)}</span> : <>N/A</>;
}
