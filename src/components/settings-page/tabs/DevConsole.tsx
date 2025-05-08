import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../../WebSocketApiRouterContext.js";
import { MQTT_TOPICS_DOCS_URL } from "../../../consts.js";
import Button from "../../Button.js";
import InputField from "../../form-fields/InputField.js";
import TextareaField from "../../form-fields/TextareaField.js";

export default function DevConsole() {
    const { t } = useTranslation(["devConsole", "zigbee"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [topic, setTopic] = useState("");
    const [payload, setPayload] = useState("{}");

    const formIsValid = useMemo(() => {
        // allow empty strings
        if (payload !== "") {
            try {
                const parsedPayload = JSON.parse(payload);

                if (typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
                    return false;
                }
            } catch {
                return false;
            }
        }

        return !!topic;
    }, [topic, payload]);

    const onExecute = useCallback(async () => {
        await sendMessage(
            // @ts-expect-error dev
            topic,
            payload === "" ? payload : JSON.parse(payload),
        );
    }, [topic, payload, sendMessage]);

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg">{t("send_mqtt")}</h2>
            <div className="alert alert-info alert-soft" role="alert">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" />
                <a href={MQTT_TOPICS_DOCS_URL} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("common:read_the_docs_info")}
                </a>
            </div>
            <InputField
                type="text"
                name="topic"
                label={t("topic")}
                detail={t("mqtt_topic_info")}
                placeholder="bridge/request/permit_join"
                defaultValue={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input validator w-full"
                required
            />
            <TextareaField
                name="payload"
                label={t("zigbee:payload")}
                rows={5}
                defaultValue={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="textarea validator w-full"
            />
            <div className="join join-vertical lg:join-horizontal">
                <Button<void> onClick={onExecute} disabled={!formIsValid} className="btn btn-success">
                    {t("zigbee:execute")}
                </Button>
            </div>
        </div>
    );
}
