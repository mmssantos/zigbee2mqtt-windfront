import type { FieldProps } from "@rjsf/utils";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

export const DescriptionField = (props: Partial<FieldProps>): JSX.Element => {
    const { description } = props;
    const { t } = useTranslation("settingsSchemaDescriptions");
    if (description) {
        return (
            <div>
                <div className="mb-3">{t(description)}</div>
            </div>
        );
    }
    return <></>;
};

export const TitleField = ({ title }: Partial<FieldProps>): JSX.Element => {
    const { t } = useTranslation("settingsSchemaTitles");

    return (
        <div className="my-1">
            <h5>{t(title as string)}</h5>
            <hr className="border-0 bg-secondary" style={{ height: "1px" }} />
        </div>
    );
};
