import type { GithubOrganization } from "@codemod-com/api-types";
import { ChevronRight } from "lucide-react";

import { getOrgNameFromUrl } from "../../utils";

type Props = {
  organization: GithubOrganization;
  onClick(repo: GithubOrganization): void;
};

const OrganizationItem = ({ organization, onClick }: Props) => {
  return (
    <div
      role="button"
      onClick={() => onClick(organization)}
      className="flex items-center justify-between px-2 py-1 bg-primary-dark dark:bg-emphasis-dark hover:bg-emphasis-light dark:hover:bg-primary-light cursor-pointer"
    >
      <span className="body-m-medium">
        {getOrgNameFromUrl(organization.url)}
      </span>
      <ChevronRight size={16} />
    </div>
  );
};

export default OrganizationItem;
