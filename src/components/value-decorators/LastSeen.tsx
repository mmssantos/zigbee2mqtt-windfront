import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import { format } from "timeago.js";
import type { DeviceState, LastSeenType } from "../../types.js";
import { formatDate, lastSeen } from "../../utils.js";

type LastSeenProps = {
    state: DeviceState;
    lastSeenType: LastSeenType;
};

export function LastSeen(props: LastSeenProps): JSX.Element {
    const { i18n } = useTranslation();
    const { state, lastSeenType } = props;
    const lastSeenDate = lastSeen(state, lastSeenType);

    return lastSeenDate ? <span title={formatDate(lastSeenDate)}>{format(lastSeenDate, i18n.language)}</span> : <>N/A</>;
}
