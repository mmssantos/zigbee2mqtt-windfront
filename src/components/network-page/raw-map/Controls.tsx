import { faDownload, faExpand, faLeftRight, faLock, faLockOpen, faMinus, faPlus, faQuestion, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ControlButton, Panel, type ReactFlowState, getNodesBounds, getViewportForBounds, useReactFlow, useStore, useStoreApi } from "@xyflow/react";
import { toPng } from "html-to-image";
import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallow } from "zustand/shallow";
import type { DagreDirection } from "../index.js";

type ControlsProps = {
    onLayout: (direction: DagreDirection) => void;
};

function downloadImage(dataUrl: string) {
    const a = document.createElement("a");

    a.setAttribute("download", `network-map-${Date.now()}.png`);
    a.setAttribute("href", dataUrl);
    a.click();
}

const imageWidth = 1920;
const imageHeight = 1080;

const selector = (s: ReactFlowState) => ({
    isInteractive: s.nodesDraggable || s.elementsSelectable,
    minZoomReached: s.transform[2] <= s.minZoom,
    maxZoomReached: s.transform[2] >= s.maxZoom,
});

const Controls = memo(({ onLayout }: ControlsProps) => {
    const { t } = useTranslation(["network", "common"]);
    const store = useStoreApi();
    const { isInteractive, minZoomReached, maxZoomReached } = useStore(selector, shallow);
    const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow();
    const [showHelp, setShowHelp] = useState(false);

    const onDownloadClick = useCallback(() => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getNodesBounds(getNodes());
        const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0.25);

        toPng(document.querySelector<HTMLElement>(".react-flow__viewport")!, {
            backgroundColor: "#1d232a",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
        }).then(downloadImage);
    }, [getNodes]);

    const onHelpClick = useCallback(() => {
        setShowHelp(!showHelp);
    }, [showHelp]);

    return (
        <>
            <Panel position="top-right" className="bg-accent-content">
                <ControlButton onClick={() => onLayout("TB")} title={t("layout_top_bottom")}>
                    <FontAwesomeIcon icon={faUpDown} className="text-accent" />
                </ControlButton>
                <ControlButton onClick={() => onLayout("LR")} title={t("layout_left_right")}>
                    <FontAwesomeIcon icon={faLeftRight} className="text-accent" />
                </ControlButton>
                <ControlButton onClick={onDownloadClick} title={t("download_image")}>
                    <FontAwesomeIcon icon={faDownload} className="text-accent" />
                </ControlButton>
            </Panel>
            <Panel position="bottom-left" className="bg-accent-content">
                <ControlButton onClick={() => zoomIn()} disabled={maxZoomReached} title={t("zoom_in")}>
                    <FontAwesomeIcon icon={faPlus} className="text-accent" />
                </ControlButton>
                <ControlButton onClick={() => zoomOut()} disabled={minZoomReached} title={t("zoom_out")}>
                    <FontAwesomeIcon icon={faMinus} className="text-accent" />
                </ControlButton>
                <ControlButton onClick={() => fitView()} title={t("fit_view")}>
                    <FontAwesomeIcon icon={faExpand} className="text-accent" />
                </ControlButton>
                <ControlButton
                    onClick={() => {
                        store.setState({
                            nodesDraggable: !isInteractive,
                            elementsSelectable: !isInteractive,
                        });
                    }}
                    title={t("toggle_interactivity")}
                >
                    <FontAwesomeIcon icon={isInteractive ? faLockOpen : faLock} className="text-accent" />
                </ControlButton>
            </Panel>
            <Panel position="top-left" className="bg-accent-content">
                <ControlButton title={t("help")} onClick={onHelpClick}>
                    <FontAwesomeIcon icon={faQuestion} className="text-accent" />
                </ControlButton>
                {showHelp && (
                    <div className="card shadow-sm max-w-prose max-h-[90vh]">
                        <div className="card-body bg-base-200 overflow-y-auto">
                            <p>{t("node_info")}</p>
                            <p className="text-primary">{t("node_of_type")} Coordinator</p>
                            <p className="text-secondary">{t("node_of_type")} Router</p>
                            <p className="text-accent">{t("node_of_type")} EndDevice</p>
                            <p className="text-warning">-- {t("link_of_type")} Parent</p>
                            <p className="text-success">-- {t("link_of_type")} Sibling</p>
                            <p className="text-info">-- {t("link_of_type")} Child</p>
                            <div className="divider my-0.5" />
                            <p>
                                {t("pan_view")}: <kbd className="kbd kbd-sm">Mouse Drag</kbd>
                            </p>
                            <p>
                                {t("zoom_view")}: <kbd className="kbd kbd-sm">Mouse Scroll</kbd>
                            </p>
                            <p>
                                {t("select_area")}: <kbd className="kbd kbd-sm">Shift</kbd>+<kbd className="kbd kbd-sm">Mouse Drag</kbd>
                            </p>
                            <p>
                                {t("change_focus")}: <kbd className="kbd kbd-sm">Tab</kbd> / <kbd className="kbd kbd-sm">Shift</kbd>+
                                <kbd className="kbd kbd-sm">Tab</kbd>
                            </p>
                            <p>
                                {t("select")}: <kbd className="kbd kbd-sm">Mouse Click</kbd> / <kbd className="kbd kbd-sm">Enter</kbd> /{" "}
                                <kbd className="kbd kbd-sm">Space</kbd>
                            </p>
                            <p>
                                {t("unselect")}: <kbd className="kbd kbd-sm">Mouse Click</kbd> (outside) / <kbd className="kbd kbd-sm">Escape</kbd>
                            </p>
                            <p>
                                {t("move_selected")}: <kbd className="kbd kbd-sm">Mouse Drag</kbd> / <kbd className="kbd kbd-sm">Up</kbd> /{" "}
                                <kbd className="kbd kbd-sm">Down</kbd> / <kbd className="kbd kbd-sm">Left</kbd> /{" "}
                                <kbd className="kbd kbd-sm">Right</kbd>
                            </p>
                        </div>
                    </div>
                )}
            </Panel>
        </>
    );
});

export default Controls;
