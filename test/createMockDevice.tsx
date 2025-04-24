import { type Device, InterviewState } from "../src/types.js";

export function createMockDevice(overrides: Partial<Device> = {}): Device {
    return {
        ieee_address: "00:1A:7D:DA:71:13",
        type: "EndDevice",
        network_address: 12345,
        power_source: "Mains (single phase)",
        model_id: "LWB010",
        manufacturer: "Philips",
        interview_state: InterviewState.Successful,
        software_build_id: "12345678",
        supported: true,
        disabled: false,
        definition: {
            description: "Hue white lamp",
            model: "LWB010",
            // supports: 'on/off, brightness', TODO
            vendor: "Philips",
            exposes: [],
            options: [],
            supports_ota: true,
            icon: "bulb",
        },
        date_code: "20191224",
        endpoints: {
            1: {
                bindings: [
                    {
                        cluster: "onOff",
                        target: {
                            id: 1,
                            type: "endpoint",
                        },
                    },
                    {
                        cluster: "levelControl",
                        target: {
                            ieee_address: "00:1A:7D:DA:71:14",
                            type: "group",
                        },
                    },
                ],
                configured_reportings: [
                    {
                        cluster: "onOff",
                        attribute: "onOff",
                        maximum_report_interval: 3600,
                        minimum_report_interval: 300,
                        reportable_change: 1,
                    },
                    {
                        cluster: "levelControl",
                        attribute: "currentLevel",
                        maximum_report_interval: 3600,
                        minimum_report_interval: 300,
                        reportable_change: 5,
                    },
                ],
                clusters: {
                    input: ["onOff", "levelControl", "genPowerCfg", "hvacUserInterfaceCfg"],
                    output: ["time"],
                },
                scenes: [
                    {
                        id: 1,
                        name: "Evening Mood",
                    },
                    {
                        id: 2,
                        name: "Morning Routine",
                    },
                ],
            },
        },
        friendly_name: "Living Room Light",
        description: "Philips Hue white lamp in the living room",
        ...overrides,
    };
}
