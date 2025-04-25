import type { JSX } from "react";
import { useTranslation } from "react-i18next";
import type { Scene } from "../../types.js";
import InputField from "../form-fields/InputField.js";
import SelectField from "../form-fields/SelectField.js";

type ScenePickerProps = {
    value?: Scene;
    scenes: Scene[];
    onSceneSelected: (sceneId: number) => void;
};
export function ScenePicker(props: ScenePickerProps): JSX.Element {
    const { t } = useTranslation("scene");
    const { onSceneSelected, scenes = [], value } = props;

    return scenes.length > 0 ? (
        <SelectField
            name="scene_picker"
            label={t("scene_name")}
            value={value?.id}
            onChange={(e) => onSceneSelected(Number.parseInt(e.target.value, 10))}
        >
            <option value="" disabled>
                {t("select_scene")}
            </option>
            {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                    {scene.id}: {scene.name}
                </option>
            ))}
        </SelectField>
    ) : (
        <InputField
            name="scene_picker"
            label={t("scene_id")}
            type="number"
            value={value?.id}
            onChange={(e) => onSceneSelected(e.target.valueAsNumber)}
            min={0}
            max={255}
        />
    );
}
