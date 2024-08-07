import { Response, type Server } from "miragejs";
import type { AppRegistry } from "..";

export const campaignEndpoints = (server: Server<AppRegistry>) => {
  server.get("/campaigns/", (schema) => schema.all("campaign"));
  server.get("/campaigns/:id/dashboards", (schema, request) => {
    const campaignId = request.params.id ?? "";
    const campaign = schema.find("campaign", campaignId);

    if (campaign === null) {
      return new Response(404, {}, { error: "Not found" });
    }

    console.log(campaign, "???");

    return campaign.dashboard;
  });
};
