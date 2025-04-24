import { type JSX, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { WebSocketApiRouterContext } from "../../WebSocketApiRouterContext.js";
import * as StateApi from "../../actions/SceneApi.js";
import type { Device, DeviceState, Group, Scene, WithFriendlyName } from "../../types.js";
import Button from "../button/Button.js";
import { ScenePicker } from "./ScenePicker.js";
import { getScenes } from "./index.js";

export interface RecallRemoveAndMayBeStoreSceneProps {
    target: Device | Group;
    deviceState: DeviceState;
}

export function RecallRemove(props: RecallRemoveAndMayBeStoreSceneProps): JSX.Element {
    const { target } = props;
    const { t } = useTranslation("scene");
    const [scene, setScene] = useState<Scene>({ id: 0, name: "Scene 0" });
    const [sceneIsNotSelected, setsceneIsNotSelected] = useState<boolean>(true);
    const scenes = getScenes(target);
    const { friendly_name } = target as WithFriendlyName;
    const { sendMessage } = useContext(WebSocketApiRouterContext);

    return (
        <>
            <h2 className="text-lg font-semibold">{t("manage_scenes_header")}</h2>
            <div className="mb-3">
                <ScenePicker
                    onSceneSelected={(sceneId) => {
                        setsceneIsNotSelected(false);
                        const foundScene = scenes.find((s) => s.id === sceneId);

                        if (foundScene !== undefined) {
                            setScene(foundScene);
                        } else {
                            setScene({ id: sceneId, name: `Scene ${sceneId}` });
                        }
                    }}
                    value={sceneIsNotSelected ? undefined : scene}
                    scenes={scenes}
                />
            </div>
            <div className="join">
                <Button
                    disabled={sceneIsNotSelected}
                    onClick={async () => await StateApi.sceneRecall(sendMessage, friendly_name, scene.id)}
                    className="btn btn-success join-item"
                >
                    {t("recall")}
                </Button>
                <Button
                    disabled={sceneIsNotSelected}
                    prompt
                    onClick={async () => await StateApi.sceneRemove(sendMessage, friendly_name, scene.id)}
                    className="btn btn-error join-item"
                >
                    {t("remove")}
                </Button>
                <Button
                    prompt
                    onClick={async () => await StateApi.sceneRemoveAll(sendMessage, friendly_name)}
                    className="btn btn-error btn-outline join-item"
                >
                    {t("remove_all")}
                </Button>
            </div>
        </>
    );
}
