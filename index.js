import { join } from "node:path";

export function getPath() {
    return join(import.meta.dirname, "dist");
}
