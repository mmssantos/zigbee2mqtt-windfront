import NiceModal from "@ebay/nice-modal-react";
import React, { lazy, Suspense, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import { HashRouter, Route, Routes } from "react-router";
import { WebSocketApiRouter } from "./WebSocketApiRouter.js";
import { AuthForm } from "./components/modal/components/AuthModal.js";
import { NavBar } from "./components/navbar/NavBar.js";
import i18n from "./i18n/index.js";
import store from "./store.js";

const DevicesPage = lazy(async () => {
    return await import("./pages/DevicesPage.js");
});
const DevicePage = lazy(async () => {
    return await import("./pages/DevicePage.js");
});
const DashboardPage = lazy(async () => {
    return await import("./pages/Dashboard.js");
});
const MapPage = lazy(async () => {
    return await import("./pages/MapHierarchy.js");
});
const GroupsPage = lazy(async () => {
    return await import("./pages/GroupsPage.js");
});
const GroupPage = lazy(async () => {
    return await import("./pages/GroupPage.js");
});
const OtaPage = lazy(async () => {
    return await import("./pages/OtaPage.js");
});
const TouchlinkPage = lazy(async () => {
    return await import("./pages/TouchlinkPage.js");
});
const LogsPage = lazy(async () => {
    return await import("./pages/LogsPage.js");
});
const SettingsPage = lazy(async () => {
    return await import("./pages/SettingsPage.js");
});

export function Main() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        // TODO: re-enable me on live
        // <ErrorBoundary>
        <React.StrictMode>
            <I18nextProvider i18n={i18n}>
                <NiceModal.Provider>
                    <AuthForm id="auth-form" onAuth={async () => {}} />
                    <Provider store={store}>
                        <HashRouter>
                            <WebSocketApiRouter>
                                <NavBar />
                                <main className="">
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <Routes>
                                            <Route path="/ota" element={<OtaPage />} />
                                            <Route path="/map" element={<MapPage />} />
                                            <Route path="/device/:dev/:tab?" element={<DevicePage />} />
                                            <Route path="/settings/:tab?" element={<SettingsPage />} />
                                            <Route path="/groups" element={<GroupsPage />} />
                                            <Route path="/group/:groupId?" element={<GroupPage />} />

                                            <Route path="/logs" element={<LogsPage />} />
                                            <Route path="/touchlink" element={<TouchlinkPage />} />
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/" element={<DevicesPage />} />
                                        </Routes>
                                    </Suspense>
                                </main>
                            </WebSocketApiRouter>
                        </HashRouter>
                    </Provider>
                </NiceModal.Provider>
            </I18nextProvider>
        </React.StrictMode>
        // </ErrorBoundary>
    );
}
