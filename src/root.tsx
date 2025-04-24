import type { SyntheticEvent } from "react";
import { Link, isRouteErrorResponse } from "react-router";
import store from "./store.js";
import { download } from "./utils.js";

const downloadState = async (e: SyntheticEvent): Promise<void> => {
    await download(store.getState() as unknown as Record<string, unknown>, "state.json");
    e.preventDefault();
};

// biome-ignore lint/suspicious/noExplicitAny: tmp
export function ErrorBoundary({ error }: any /* TODO: Route.ErrorBoundaryProps */) {
    if (isRouteErrorResponse(error)) {
        return (
            <>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </>
        );
    }
    if (error instanceof Error) {
        const githubUrlParams = {
            template: "bug_report.yaml",
            stacktracke: [
                `**Current url**: ${window.location.toString()}`,
                `**Previous url**: ${document.referrer}`,
                "\n",
                `**Error type**: ${error?.name}`,
                `**Error message**: ${error?.message}`,
                "\n\n",
                error?.stack,
            ].join("\n"),
        } as Record<string, string>;

        const githubUrl = `https://github.com/Nerivec/zigbee2mqtt-windfront/issues/new?${new URLSearchParams(githubUrlParams).toString()}`;

        return (
            <div className="container">
                <h1 className="text-error">Hello, you&apos;ve found a bug. Congratulations!</h1>
                <ol>
                    <li className="fs-1 lh-lg">Calm down</li>
                    <li className="fs-1 lh-lg">
                        <Link className="link link-hover link-primary animate-ping" to="#" onClick={downloadState}>
                            Click here, and save this file
                        </Link>
                    </li>

                    <li className="fs-1 lh-lg">
                        <Link target="_blank" rel="noopener noreferrer" to={githubUrl} className="link link-hover">
                            Raise a github issue
                        </Link>
                        , attach <b>previously</b> downloaded file
                    </li>
                    <li className="fs-1 lh-lg">Take a screenshot of this page and attach to the issue</li>
                    <li className="fs-1 lh-lg">
                        In the github issue write detailed description for the issue, how this happened? Steps to reproduce
                    </li>
                </ol>
                <div>
                    <div>{error.name}</div>
                    <div>{error.message}</div>
                    <pre>{error.stack}</pre>
                </div>
            </div>
        );
    }

    return <h1>Unknown Error</h1>;
}
