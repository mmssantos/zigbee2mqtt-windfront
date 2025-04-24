import type { JSX } from "react";
import { format } from "timeago.js";
import type { DeviceState, LastSeenType } from "../types.js";
import { formatDate, lastSeen } from "../utils.js";

import { useTranslation } from "react-i18next";

type LastSeenProps = {
    state: DeviceState;
    lastSeenType: LastSeenType;
};
export function LastSeen(props: LastSeenProps): JSX.Element {
    const { i18n } = useTranslation();
    const { state, lastSeenType } = props;
    const lastSeenDate = lastSeen(state, lastSeenType);
    if (lastSeenDate) {
        return <span title={formatDate(lastSeenDate)}>{format(lastSeenDate, i18n.language)}</span>;
    }
    return <>N/A</>;
}
