import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as DeviceApi from "../../actions/DeviceApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Device } from "../../types.js";
import { supportNewDevicesUrl } from "../../utils.js";
import Button from "../button/Button.js";

export interface ExternalDefinitionProps {
    device: Device;
}

export function ExternalDefinition(props: ExternalDefinitionProps) {
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const onGenerateExternalDefinitionClick = async (): Promise<void> => {
        const { device } = props;
        await DeviceApi.generateExternalDefinition(sendMessage, device.ieee_address);
    };
    const { t } = useTranslation(["devConsole", "common"]);

    const { device } = props;
    const generatedExternalDefinitions = useAppSelector((state) => state.generatedExternalDefinitions);
    const externalDefinition = generatedExternalDefinitions[device.ieee_address];

    if (externalDefinition) {
        return (
            <>
                {t("generated_external_definition")} (
                <a href={supportNewDevicesUrl} target="_blank" rel="noreferrer" className="link link-hover">
                    {t("documentation")}
                </a>
                )
                <textarea defaultValue={externalDefinition} />
            </>
        );
    }
    return (
        <Button<void> className="btn btn-primary" onClick={onGenerateExternalDefinitionClick}>
            {t("generate_external_definition")}
        </Button>
    );
}
