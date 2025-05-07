import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { format } from "timeago.js";
import type { DeviceState, LastSeenConfig } from "../../types.js";
import { formatDate, lastSeen } from "../../utils.js";

type LastSeenProps = {
    state: DeviceState;
    config: LastSeenConfig;
};

export function LastSeen({ state, config }: LastSeenProps): JSX.Element {
    const { i18n } = useTranslation();
    const lastSeenDate = lastSeen(state, config);

    return lastSeenDate ? <span title={formatDate(lastSeenDate)}>{format(lastSeenDate, i18n.language)}</span> : <>N/A</>;
}
