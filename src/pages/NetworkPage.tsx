import { faDownLong, faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../WebSocketApiRouterContext.js";
import Button from "../components/Button.js";
import CheckboxField from "../components/form-fields/CheckboxField.js";
import SelectField from "../components/form-fields/SelectField.js";
import RawNetworkMap from "../components/network-page/RawNetworkMap.js";
import type { MapType } from "../components/network-page/index.js";
import { useAppDispatch, useAppSelector } from "../hooks/useApp.js";
import { setNetworkMapIsLoading } from "../store.js";

export default function NetworkPage() {
    const dispatch = useAppDispatch();
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const { t } = useTranslation(["network", "common"]);
    const networkMapIsLoading = useAppSelector((state) => state.networkMapIsLoading);
    const networkMap = useAppSelector((state) => state.networkMap);
    const [mapType, setMapType] = useState<MapType>("raw");
    const [enableRoutes, setEnableRoutes] = useState(false);

    const onMapTypeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value) {
            setMapType(event.target.value as MapType);
        }
    }, []);

    const onEnableRoutesChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setEnableRoutes(event.target.checked);
    }, []);

    const onRequestClick = useCallback(async () => {
        dispatch(setNetworkMapIsLoading());
        await sendMessage("bridge/request/networkmap", { type: mapType, routes: enableRoutes });
    }, [mapType, enableRoutes, dispatch, sendMessage]);

    const content = useMemo(() => {
        if (networkMapIsLoading) {
            return (
                <>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <span className="loading loading-infinity loading-xl" />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">{t("loading")}</div>
                </>
            );
        }

        if (networkMap) {
            switch (networkMap.type) {
                case "raw": {
                    return <RawNetworkMap map={networkMap.value} />;
                }
                case "graphviz": {
                    // TODO
                    // https://dreampuf.github.io/GraphvizOnline
                    // https://edotor.net/
                    return <textarea className="textarea w-full" rows={5} readOnly value={networkMap.value} />;
                }
                case "plantuml": {
                    // TODO
                    // https://editor.plantuml.com/uml/
                    // https://www.planttext.com/
                    return <textarea className="textarea w-full" rows={5} readOnly value={networkMap.value} />;
                }
            }
        }

        return null;
    }, [networkMap, networkMapIsLoading, t]);

    return (
        <>
            <div className="flex flex-row justify-center gap-3 mb-3">
                <SelectField name="type" label={t("type")} value={mapType} onChange={onMapTypeChange}>
                    <option value="raw">raw</option>
                    <option value="graphviz">graphviz</option>
                    <option value="plantuml">plantuml</option>
                </SelectField>
                <CheckboxField name="enable_routes" label={t("enable_routes")} onChange={onEnableRoutesChange} />
                <Button
                    className="btn btn-primary btn-square self-center ms-3"
                    onClick={onRequestClick}
                    title={networkMap ? t("reload") : t("load")}
                    disabled={networkMapIsLoading}
                >
                    {networkMap ? <FontAwesomeIcon icon={faSync} /> : <FontAwesomeIcon icon={faDownLong} />}
                </Button>
            </div>

            {content}
        </>
    );
}
