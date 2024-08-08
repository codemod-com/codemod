import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const dashboardFactory = Factory.extend({
  name() {
    return faker.company.name();
  },
});
