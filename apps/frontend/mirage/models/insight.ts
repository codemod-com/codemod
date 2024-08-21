import { Model, hasMany } from "miragejs";

export const insightModel = Model.extend({
  dashboard: hasMany(),
});
