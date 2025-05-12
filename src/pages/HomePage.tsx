import { type JSX, useEffect } from "react";
import { useNavigate } from "react-router";
import store2 from "store2";
import { HOMEPAGE_KEY } from "../localStoreConsts.js";

// XXX: workaround typing
const local = store2 as unknown as typeof store2.default;

export default function HomePage(): JSX.Element {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(local.get(HOMEPAGE_KEY) === "dashboard" ? "/dashboard" : "/devices", { replace: true });
    }, [navigate]);

    return <></>;
}
