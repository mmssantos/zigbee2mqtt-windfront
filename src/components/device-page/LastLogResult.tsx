import type { JSX } from "react";
import { LEVEL_CMAP } from "../../consts.js";
import type { LogMessage } from "../../store.js";

export type LastLogResultProps = {
    message: LogMessage;
};

export function LastLogResult(props: LastLogResultProps): JSX.Element {
    const { message } = props;

    return (
        <div className="mockup-code w-full">
            <pre data-prefix="~" className={LEVEL_CMAP[message.level]}>
                <code>
                    [{message.timestamp}] {message.message}
                </code>
            </pre>
        </div>
    );
}
