import type { GHBranch } from "@codemod-com/api-types";
import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const branchFactory = Factory.extend<Omit<GHBranch, "id">>({
  name() {
    return faker.company.name();
  },
  commit() {
    return {
      sha: faker.datatype.uuid(),
      url: faker.internet.url(),
    };
  },
  protected() {
    return false;
  },
  protection() {
    return {
      enabled: false,
      required_status_checks: {
        enforcement_level: "",
        contexts: [],
      },
    };
  },
});
