import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

export const ReadTheDocsInfo = (props: { docsUrl: string }): JSX.Element => {
    const { docsUrl } = props;
    const { t } = useTranslation("common");
    return (
        <div className="card alert alert-info" role="alert">
            <div className="card-body">
                <FontAwesomeIcon icon={faCircleInfo} size="2xl" className="me-2" />
                <a href={docsUrl} target="_blank" rel="noreferrer" className="link link-hover link-secondary align-middle">
                    {t("read_the_docs_info")}
                </a>
            </div>
        </div>
    );
};
