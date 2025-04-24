import type { AvailabilityState } from "../src/store.js";
import type { Message } from "../src/types.js";

export const DEVICE_AVAILABILITY: Message<AvailabilityState>[] = [
    {
        payload: "offline",
        topic: "0xbc33acfffe17628b/availability",
    },
    {
        payload: {
            state: "offline",
        },
        topic: "hue1/availability",
    },
    {
        payload: "offline",
        topic: "hue_back_tv/availability",
    },
    {
        payload: "online",
        topic: "0x00158d000224154d/availability",
    },
    {
        payload: "online",
        topic: "0x00124b001e73227f1/availability",
    },
    {
        payload: "online",
        topic: "livingroom/temp_humidity/availability",
    },
    {
        payload: "online",
        topic: "livingroom/window/availability",
    },
    {
        payload: "online",
        topic: "livingroom/ac power/availability",
    },
    {
        payload: "online",
        topic: "0x00158d0004866f11/availability",
    },
    {
        payload: "online",
        topic: "dining room/ac power/availability",
    },
    {
        payload: "offline",
        topic: "0x0017880103d55d65/availability",
    },
    {
        payload: "offline",
        topic: "hue lights/availability",
    },
    {
        payload: "online",
        topic: "901/availability",
    },
];
