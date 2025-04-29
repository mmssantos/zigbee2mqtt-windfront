import { type JSX, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import type { CompositeFeature, Device, DeviceState, GenericFeature, Group } from "../../types.js";
import { isDevice } from "../../utils.js";
import Button from "../button/Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { Composite } from "../features/Composite.js";
import InputField from "../form-fields/InputField.js";
import { getScenes, getScenesFeatures, isValidSceneId } from "./index.js";

type AddSceneProps = {
    target: Device | Group;
    deviceState: DeviceState;
};

export function AddScene(props: AddSceneProps): JSX.Element {
    const { target, deviceState } = props;
    const { t } = useTranslation("scene");
    const { sendMessage } = useContext(WebSocketApiRouterContext);
    const [sceneId, setSceneId] = useState<number>(0);
    const [sceneName, setSceneName] = useState<string>("");
    const scenes = useMemo(() => getScenes(target), [target]);
    const filteredFeatures = useMemo(() => {
        const filtered: (GenericFeature | CompositeFeature)[] = [];

        if (isDevice(target)) {
            for (const feature of target.definition?.exposes ?? []) {
                const validFeature = getScenesFeatures(feature, deviceState);

                if (validFeature) {
                    filtered.push(validFeature);
                }
            }
        }

        return filtered;
    }, [target, deviceState]);

    const onCompositeChange = useCallback(
        async (value: Record<string, unknown> | unknown) => {
            await sendMessage<"{friendlyNameOrId}/set">(
                // @ts-expect-error templated API endpoint
                `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                value,
            );
        },
        [sendMessage, target],
    );

    const onStoreClick = useCallback(async () => {
        const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = { ID: sceneId, name: sceneName || `Scene ${sceneId}` };

        await sendMessage<"{friendlyNameOrId}/set">(
            // @ts-expect-error templated API endpoint
            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
            { scene_store: payload },
        );
    }, [sendMessage, target, sceneId, sceneName]);

    return (
        <>
            <h2 className="text-lg font-semibold">{t("add_update_header")}</h2>
            <div className="mb-3">
                <InputField
                    name="scene_id"
                    label={t("scene_id")}
                    type="number"
                    value={sceneId}
                    onChange={(e) => setSceneId(e.target.valueAsNumber)}
                    min={0}
                    max={255}
                />
                <InputField
                    name="scene_name"
                    label={t("scene_name")}
                    type="string"
                    value={sceneName}
                    placeholder={`Scene ${sceneId}`}
                    onChange={(e) => setSceneName(e.target.value)}
                />
                <div className="card card-border bg-base-100 my-2">
                    <div className="card-body">
                        <Composite
                            feature={{ features: filteredFeatures } as CompositeFeature}
                            className="row"
                            type="composite"
                            device={target as Device}
                            deviceState={deviceState}
                            onChange={onCompositeChange}
                            featureWrapperClass={DashboardFeatureWrapper}
                            minimal={true}
                        />
                    </div>
                </div>
            </div>
            <Button disabled={!isValidSceneId(sceneId, scenes)} onClick={onStoreClick} className="btn btn-primary">
                {t("store")}
            </Button>
        </>
    );
}
