import { faker } from "@faker-js/faker";
import { Factory } from "miragejs";

export const campaignFactory = Factory.extend({
  name() {
    return faker.company.name();
  },
});
