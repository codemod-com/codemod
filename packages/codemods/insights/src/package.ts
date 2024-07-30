import semver from 'semver';

export type PackageJson = {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

export type PackageData = {
    packageName: string;
    packageVersionRange: string;
}

export type Options = {
    onlyProd: boolean;
    pnpmWorkspace?: PnpmWorkspace;
}

type PnpmWorkspace = {
    catalog?: Record<string, string>;
};

// gets packages from package.json
export const getPackages = (packageJson: PackageJson, options: Options): PackageData[] => {
    const depsToCheck = { ...packageJson.dependencies, ...(!options.onlyProd && { ...packageJson.devDependencies }) };

    return Object.entries(depsToCheck).map(([packageName, packageVersionRange]) => ({
        packageName,
        packageVersionRange,
    }))
};

export const getPackageVersionRangeFromWorkspace = (packageName: string, pnpmWorkspace: PnpmWorkspace) => pnpmWorkspace?.catalog?.[packageName] ?? null;

export const getPackagesData = (packageJson: Record<string, string>, options: Options): PackageData[] => {
    const getPackageCatalogVersionRange = (packageData: PackageData) => packageData.packageVersionRange === 'catalog:' && options.pnpmWorkspace ? ({ ...packageData, packageVersionRange: getPackageVersionRangeFromWorkspace(packageData.packageName, options.pnpmWorkspace) }) : packageData;

    const isValidVersionRange = ({ packageVersionRange }: PackageData) => packageVersionRange !== null && semver.validRange(packageVersionRange);

    return getPackages(packageJson, options)
        .map(getPackageCatalogVersionRange)
        .filter(isValidVersionRange)
}


