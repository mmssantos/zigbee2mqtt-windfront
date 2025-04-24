import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// biome-ignore lint/suspicious/noExplicitAny: tmp
export function ErrorBoundary({ error, children }: any) {
    if (error) {
        return <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="text-error" title="Missing image" />;
    }
    return children;
}
