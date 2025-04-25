import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as SceneApi from "../../actions/SceneApi.js";
import * as StateApi from "../../actions/StateApi.js";
import type { CompositeFeature, Device, DeviceState, GenericFeature, Group } from "../../types.js";
import { isDevice } from "../../utils.js";
import Button from "../button/Button.js";
import DashboardFeatureWrapper from "../dashboard-page/DashboardFeatureWrapper.js";
import { Composite } from "../features/composite/Composite.js";
import { InputField } from "../form-fields/InputField.js";
import { getScenes, isValidSceneId, onlyValidFeaturesForScenes } from "./index.js";

type AddSceneProps = {
    target: Device | Group;
    deviceState: DeviceState;
};

export function AddScene(props: AddSceneProps): JSX.Element {
    const { target, deviceState } = props;
    const scenes = getScenes(target);
    const { t } = useTranslation("scene");
    const [sceneId, setSceneId] = useState<SceneApi.SceneId>(0);
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
                    defaultValue={sceneId}
                    onChange={(e) => setSceneId(e.target.valueAsNumber)}
                    min={0}
                    max={255}
                />
                <InputField
                    name="scene_name"
                    label={t("scene_name")}
                    type="string"
                    defaultValue={sceneName}
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
                        await StateApi.setDeviceState(sendMessage, target.friendly_name, value);
                    }}
                    featureWrapperClass={DashboardFeatureWrapper}
                    minimal={true}
                />
            </div>
            <Button
                disabled={!isValidSceneId(sceneId, scenes)}
                onClick={async () =>
                    await SceneApi.sceneStore(sendMessage, target.friendly_name, {
                        id: sceneId,
                        name: sceneName || defaultSceneName,
                    })
                }
                className="btn btn-primary"
            >
                {t("store")}
            </Button>
        </>
    );
}
