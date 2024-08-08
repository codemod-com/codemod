export const getOrgNameFromUrl = (orgUrl: string) => {
  return orgUrl.replace("https://api.github.com/orgs/", "");
};
