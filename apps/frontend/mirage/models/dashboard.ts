import { Model, belongsTo } from "miragejs";

export const dashboardModel = Model.extend({
  insight: belongsTo(),
});
