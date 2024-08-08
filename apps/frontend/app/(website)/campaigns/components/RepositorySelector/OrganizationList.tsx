import type { GithubOrganization } from "@codemod-com/api-types";
import { memo } from "react";
import OrganizationItem from "./OrganizationItem";

type Props = {
  organizations: GithubOrganization[];
  onSelectOrganization(repo: GithubOrganization): void;
};

const OrganizationList = ({ organizations, onSelectOrganization }: Props) => {
  return (
    <ul className="flex flex-col gap-xxs m-0">
      {organizations.map((organization) => (
        <li key={organization.id}>
          <OrganizationItem
            organization={organization}
            onClick={onSelectOrganization}
          />
        </li>
      ))}
    </ul>
  );
};

export default memo(OrganizationList);
