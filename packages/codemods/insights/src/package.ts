export type PackageJson = {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

export type Options = {
    onlyProd: boolean;
}

export const getPackages = (packageJson: PackageJson, options: Options) => {
    const depsToCheck = { ...packageJson.dependencies, ...(!options.onlyProd && { ...packageJson.devDependencies }) };

    return Object.entries(depsToCheck).map(([packageName, packageVersionRange]) => ({
        packageName,
        packageVersionRange,
    }))
};



