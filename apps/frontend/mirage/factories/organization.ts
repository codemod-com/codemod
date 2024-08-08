import type { GithubOrganization } from "@codemod-com/api-types";
import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const organizationFactory = Factory.extend<
  Omit<GithubOrganization, "id">
>({
  url() {
    return faker.internet.url();
  },
  description() {
    return faker.lorem.paragraph();
  },
});
