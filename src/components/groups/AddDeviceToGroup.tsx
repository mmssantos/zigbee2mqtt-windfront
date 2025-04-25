import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as GroupsApi from "../../actions/GroupsApi.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Device, Endpoint, Group } from "../../types.js";
import { getEndpoints } from "../../utils.js";
import Button from "../button/Button.js";
import DevicePicker from "../pickers/DevicePicker.js";
import EndpointPicker from "../pickers/EndpointPicker.js";

interface AddDeviceToGroupProps {
    group: Group;
}

export function AddDeviceToGroup(props: AddDeviceToGroupProps): JSX.Element {
    const [endpoint, setEndpoint] = useState<Endpoint>("");
    const [device, setDevice] = useState<string>("");
    const { group } = props;
    const devices = useAppSelector((state) => state.devices);

    const deviceObj = devices[device as string];
    const endpoints = getEndpoints(deviceObj);
    const { t } = useTranslation(["groups", "zigbee"]);
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const onSubmit = async (): Promise<void> => {
        await GroupsApi.addDeviceToGroup(sendMessage, device, endpoint, group.friendly_name);
    };
    const onDeviceSelect = (d: Device): void => {
        const eps = getEndpoints(d);
        setDevice(d.ieee_address);
        setEndpoint(eps[0]);
    };

    const onEpChange = (ep: Endpoint): void => {
        setEndpoint(ep);
    };

    return (
        <>
            <h2 className="text-lg font-semibold">{t("add_to_group_header")}</h2>
            <div className="mb-3">
                <DevicePicker label={t("zigbee:device")} value={device as string} devices={devices} onChange={onDeviceSelect} />
                <EndpointPicker label={t("zigbee:endpoint")} values={endpoints} value={endpoint as Endpoint} onChange={onEpChange} />
            </div>
            <Button<void> onClick={onSubmit} className="btn btn-primary">
                {t("add_to_group")}
            </Button>
        </>
    );
}
