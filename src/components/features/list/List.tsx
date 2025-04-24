import cx from "classnames";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type CompositeFeature, type Endpoint, FeatureAccessMode, type GenericExposedFeature, type ListFeature } from "../../../types.js";
import Button from "../../button/Button.js";
import RangeListEditor from "../../range-list-editor/RangeListEditor.js";
import BaseViewer from "../BaseViewer.js";
import ListEditor from "../ListEditor.js";
import NoAccessError from "../NoAccessError.js";
import type { BaseFeatureProps } from "../index.js";

interface State {
    // biome-ignore lint/suspicious/noExplicitAny: tmp
    value: any[];
}

type Props = BaseFeatureProps<ListFeature> & {
    parentFeatures: (CompositeFeature | GenericExposedFeature)[];
};

export function List(props: Props) {
    const [state, setState] = useState<State>({ value: [] });
    const { t } = useTranslation(["list", "common"]);

    useEffect(() => {
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        setState({ value: props.feature.property ? ((props.deviceState[props.feature.property] as any[]) ?? []) : [] });
    }, [props.feature.property, props.deviceState]);

    // biome-ignore lint/suspicious/noExplicitAny: tmp
    const onChange = (value: any[]): void => {
        const { endpoint, property } = props.feature;
        setState({ value });
        if (!isListRoot()) {
            props.onChange(endpoint as Endpoint, property ? { [property]: value } : value);
        }
    };

    const onApply = () => {
        const { value } = state;
        const { endpoint, property } = props.feature;
        props.onChange(endpoint as Endpoint, property ? { [property]: value } : value);
    };

    const isListRoot = (): boolean => {
        const { parentFeatures } = props;
        return (
            parentFeatures !== undefined &&
            (parentFeatures.length === 1 ||
                // When parent is e.g. climate
                (parentFeatures.length === 2 && ![null, undefined, "composite", "list"].includes(parentFeatures[1].type)))
        );
    };

    const { feature, minimal, parentFeatures } = props;
    const { access = FeatureAccessMode.ACCESS_WRITE, item_type: itemType } = feature;
    if (access & FeatureAccessMode.ACCESS_WRITE) {
        if (itemType === "number") {
            return <RangeListEditor onChange={onChange} value={state.value} minimal={minimal} />;
        }
        const result = [
            <ListEditor key="1" feature={itemType} parentFeatures={[...parentFeatures, feature]} onChange={onChange} value={state.value} />,
        ];

        if (isListRoot()) {
            result.push(
                <div key="2">
                    <Button className={cx("btn btn-primary float-end", { "btn-sm": minimal })} onClick={onApply}>
                        {t("common:apply")}
                    </Button>
                </div>,
            );
        }

        return result;
    }
    if (access & FeatureAccessMode.ACCESS_STATE) {
        return <BaseViewer {...props} />;
    }
    return <NoAccessError {...props} />;
}
