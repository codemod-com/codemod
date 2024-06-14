import { type User, createClerkClient } from "@clerk/backend";
import type { FastifyReply, FastifyRequest } from "fastify";
import { clerkOptions } from "../../config";

const clerk = createClerkClient(clerkOptions);

export async function getUser(request: FastifyRequest, reply: FastifyReply) {
  const { userId, sessionClaims } = request.auth;

  if (!userId && !sessionClaims) {
    return reply.code(401).send();
  }

  const user = sessionClaims?.user as User;

  const organizations = (
    await clerk.users.getOrganizationMembershipList({ userId })
  ).data.map(({ organization }) => organization);

  const namespaces = [...organizations.map(({ slug }) => slug), user?.username];

  if (namespaces.includes("verified-publishers")) {
    namespaces.push("codemod-com", "codemod.com");
  }

  reply.type("application/json").code(200);
  return { user, organizations, namespaces };
}
