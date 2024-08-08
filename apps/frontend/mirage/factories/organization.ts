import type { GithubOrganization } from "@codemod-com/api-types";
import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const organizationFactory = Factory.extend<
  Omit<GithubOrganization, "id">
>({
  url() {
    return `https://api.github.com/orgs/${faker.internet.domainWord()}`;
  },
  description() {
    return faker.lorem.paragraph();
  },
});
