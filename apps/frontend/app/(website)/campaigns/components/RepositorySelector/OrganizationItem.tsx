import type { GithubOrganization } from "@codemod-com/api-types";
import { ChevronRight } from "lucide-react";

type Props = {
  organization: GithubOrganization;
  onClick(repo: GithubOrganization): void;
};

const OrganizationItem = ({ organization, onClick }: Props) => {
  return (
    <div
      role="button"
      onClick={() => onClick(organization)}
      className={
        "flex flex-col gap-[12px] py-xs px-[12px] bg-emphasis-light dark:bg-emphasis-dark rounded-[8px] hover:bg-primary-dark dark:hover:bg-primary-light border cursor-pointer"
      }
    >
      <span className="body-m-medium">{organization.url}</span>
      <ChevronRight />
    </div>
  );
};

export default OrganizationItem;
