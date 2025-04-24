import NiceModal from "@ebay/nice-modal-react";
import { useCallback, useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import store2 from "store2";
import type { Zigbee2MQTTResponse } from "zigbee2mqtt/dist/types/api.js";
import { AUTH_FLAG_KEY, TOKEN_KEY } from "../localStoreConsts.js";
import type { Message } from "../types.js";
import { isSecurePage, randomString, stringifyWithPreservingUndefinedAsNull } from "../utils.js";

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;
const UNAUTHORIZED_ERROR_CODE = 4401;

export type ApiSendMessage = (topic: string, payload: Record<string, unknown>) => Promise<void>;

// biome-ignore lint/suspicious/noExplicitAny: tmp
const pendingRequests = new Map<string, [() => void, (reason: any) => void]>();
let transactionNumber = 1;
const transactionRndPrefix = randomString(5);

const websocketUrlProvider = async (): Promise<string> => {
    const apiUrl = `${window.location.host}${document.location.pathname}api`;

    return await new Promise<string>((resolve) => {
        const url = new URL(`${isSecurePage() ? "wss" : "ws"}://${apiUrl}`);
        const authRequired = !!local.get(AUTH_FLAG_KEY);

        if (authRequired) {
            const token = new URLSearchParams(window.location.search).get("token") ?? local.get(TOKEN_KEY);

            if (!token) {
                NiceModal.show("auth-form", {
                    onAuth: (token: string) => {
                        local.set(TOKEN_KEY, token);
                        url.searchParams.append("token", token);
                        resolve(url.toString());
                    },
                });

                return;
            }

            url.searchParams.append("token", token);
        }

        resolve(url.toString());
    });
};

// biome-ignore lint/suspicious/noExplicitAny: tmp
export const resolvePendingRequests = (message: Zigbee2MQTTResponse<any>): void => {
    if (message.transaction != null && pendingRequests.has(message.transaction)) {
        const [resolve, reject] = pendingRequests.get(message.transaction)!;

        if (message.status === "ok" || message.status == null) {
            resolve();
        } else {
            reject(message.error);
        }

        pendingRequests.delete(message.transaction);
    }
};

export function useApiWebSocket() {
    const unmounted = useRef(false);
    const optionsRef = useRef({
        disableJson: false,
        share: true,
        retryOnError: true,
        shouldReconnect: (event: WebSocketEventMap["close"]): boolean => {
            webSocketCheckUnauthorized(event);

            return unmounted.current === false;
        },
        reconnectInterval: 3000,
        reconnectAttempts: 10,
        onOpen: (e) => console.log("WebSocket opened", e),
        onClose: (e) => console.log("WebSocket closed", e),
        onError: (e) => console.log("WebSocket error", e),
    });
    const {
        sendMessage: sendMessageRaw,
        lastJsonMessage,
        readyState,
    } = (useWebSocket as unknown as typeof useWebSocket.default)<Message | null>(websocketUrlProvider, optionsRef.current);
    const webSocketCheckUnauthorized = useCallback((event: WebSocketEventMap["close"]): void => {
        if (event.code === UNAUTHORIZED_ERROR_CODE) {
            local.set(AUTH_FLAG_KEY, true);
            local.remove(TOKEN_KEY);
        }
    }, []);

    useEffect(() => {
        return () => {
            unmounted.current = true;
        };
    }, []);

    // wrap raw sendMessage
    const sendMessage: ApiSendMessage = useCallback(
        async (topic: string, payload: Record<string, unknown> = {}): Promise<void> => {
            console.debug("Calling API: ", topic, payload);

            if (topic.startsWith("bridge/request/")) {
                const transaction = `${transactionRndPrefix}-${transactionNumber++}`;
                const promise = new Promise<void>((resolve, reject) => {
                    pendingRequests.set(transaction, [resolve, reject]);
                });

                sendMessageRaw(stringifyWithPreservingUndefinedAsNull({ topic, payload: { ...payload, transaction } }));

                return await promise;
            }

            sendMessageRaw(stringifyWithPreservingUndefinedAsNull({ topic, payload }));

            return await Promise.resolve();
        },
        [sendMessageRaw],
    );

    return { sendMessage, lastJsonMessage, readyState };
}
