export const formatOtaFileVersion = (version: number | null | undefined) => {
    if (version == null || version < 0) {
        return undefined;
    }

    const versionString = version.toString(16).padStart(8, "0");
    const appRelease = `${versionString[0]}.${versionString[1]}`;
    const appBuild = Number.parseInt(versionString.slice(2, 4), 16);
    const stackRelease = `${versionString[4]}.${versionString[5]}`;
    const stackBuild = Number.parseInt(versionString.slice(6), 16);

    return [appRelease, appBuild, stackRelease, stackBuild];
};
