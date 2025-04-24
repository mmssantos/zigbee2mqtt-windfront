import { join } from "node:path";

export function getPath() {
    return join(__dirname, "dist");
}
