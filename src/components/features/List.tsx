import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type CompositeFeature, FeatureAccessMode, type GenericFeature, type ListFeature } from "../../types.js";
import Button from "../button/Button.js";
import RangeListEditor from "../editors/RangeListEditor.js";
import BaseViewer from "./BaseViewer.js";
import ListEditor from "./ListEditor.js";
import NoAccessError from "./NoAccessError.js";
import type { BaseFeatureProps } from "./index.js";

interface State {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
}

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: (CompositeFeature | GenericFeature)[];
};

const isListRoot = (parentFeatures: (CompositeFeature | GenericFeature)[]): boolean => {
    return (
        parentFeatures !== undefined &&
        (parentFeatures.length === 1 ||
            // When parent is e.g. climate
            (parentFeatures.length === 2 && ![null, undefined, "composite", "list"].includes(parentFeatures[1].type)))
    );
};

export default function List(props: Props) {
    const { feature, minimal, parentFeatures, onChange, deviceState } = props;
    const [state, setState] = useState<State>({ value: [] });
    const { t } = useTranslation(["list", "common"]);

    useEffect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        setState({ value: feature.property ? ((deviceState[feature.property] as any[]) ?? []) : [] });
    }, [feature.property, deviceState]);

    const onEditorChange = useCallback(
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        (value: any[]): void => {
            setState({ value });

            if (!isListRoot(parentFeatures)) {
                onChange(feature.property ? { [feature.property]: value } : value);
            }
        },
        [feature.property, onChange, parentFeatures],
    );

    const onApply = useCallback(() => {
        onChange(feature.property ? { [feature.property]: state.value } : state.value);
    }, [feature.property, onChange, state.value]);

    const { access = FeatureAccessMode.SET, item_type: itemType } = feature;

    if (access & FeatureAccessMode.SET) {
        // TODO: verify this
        if (itemType.type === "numeric") {
            return <RangeListEditor onChange={onEditorChange} value={state.value} minimal={minimal} />;
        }

        return (
            <>
                <ListEditor feature={itemType} parentFeatures={[...parentFeatures, feature]} onChange={onEditorChange} value={state.value} />
                {isListRoot(parentFeatures) && (
                    <Button className={`btn btn-primary float-end${minimal ? " btn-sm" : ""}`} onClick={onApply}>
                        {t("common:apply")}
                    </Button>
                )}
            </>
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
}
