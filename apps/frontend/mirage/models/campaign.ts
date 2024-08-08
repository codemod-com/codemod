import { Model, hasMany } from "miragejs";

export const campaignModel = Model.extend({
  dashboard: hasMany(),
});
