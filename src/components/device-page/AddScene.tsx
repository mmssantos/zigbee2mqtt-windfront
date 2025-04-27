import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import type { CompositeFeature, Device, DeviceState, GenericFeature, Group } from "../../types.js";
import { isDevice } from "../../utils.js";
import Button from "../button/Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { Composite } from "../features/Composite.js";
import InputField from "../form-fields/InputField.js";
import { getScenes, isValidSceneId, onlyValidFeaturesForScenes } from "./index.js";

type AddSceneProps = {
    target: Device | Group;
    deviceState: DeviceState;
};

export function AddScene(props: AddSceneProps): JSX.Element {
    const { target, deviceState } = props;
    const scenes = getScenes(target);
    const { t } = useTranslation("scene");
    const [sceneId, setSceneId] = useState<number>(0);
    const [sceneName, setSceneName] = useState<string>("");
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    const defaultSceneName = `Scene ${sceneId}`;
    const filteredFeatures: (GenericFeature | CompositeFeature)[] = [];

    if (isDevice(target)) {
        for (const feature of target.definition?.exposes ?? []) {
            const validFeature = onlyValidFeaturesForScenes(feature, deviceState);

            if (validFeature) {
                filteredFeatures.push(validFeature);
            }
        }
    }

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
                    placeholder={defaultSceneName}
                    onChange={(e) => setSceneName(e.target.value)}
                />

                <Composite
                    feature={{ features: filteredFeatures } as CompositeFeature}
                    className="row"
                    type="composite"
                    device={target as Device}
                    deviceState={deviceState}
                    onChange={async (_endpoint, value) => {
                        await sendMessage<"{friendlyNameOrId}/set">(
                            // @ts-expect-error templated API endpoint
                            `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                            value,
                        );
                    }}
                    featureWrapperClass={DashboardFeatureWrapper}
                    minimal={true}
                />
            </div>
            <Button
                disabled={!isValidSceneId(sceneId, scenes)}
                onClick={async () => {
                    const payload: Zigbee2MQTTAPI["{friendlyNameOrId}/set"][string] = { ID: sceneId, name: sceneName || defaultSceneName };

                    await sendMessage<"{friendlyNameOrId}/set">(
                        // @ts-expect-error templated API endpoint
                        `${target.friendly_name}/set`, // TODO: swap to ID/ieee_address
                        { scene_store: payload },
                    );
                }}
                className="btn btn-primary"
            >
                {t("store")}
            </Button>
        </>
    );
}
