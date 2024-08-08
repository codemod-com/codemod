import type { GithubRepository } from "@codemod-com/api-types";
import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const repositoryFactory = Factory.extend<Omit<GithubRepository, "id">>({
  name() {
    return faker.company.name();
  },
  full_name() {
    return faker.company.name();
  },
  private() {
    return faker.datatype.boolean();
  },
  html_url() {
    return "https://github.com";
  },
  default_branch: "master",
  permissions: {
    admin: true,
    push: true,
    pull: false,
  },
});
