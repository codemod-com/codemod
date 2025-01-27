import NextAuth from "next-auth";
import Zitadel from "next-auth/providers/zitadel";

const handler = NextAuth({
  providers: [
    Zitadel({
      issuer: process.env.ZITADEL_ISSUER!,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      userinfo: {
        params: {
          scope: "openid email profile",
        },
      },
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          loginName: profile.preferred_username,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log(token, user, account);
      token.user ??= user;
      token.accessToken ??= account?.access_token;
      token.refreshToken ??= account?.refresh_token;
      token.expiresAt ??= (account?.expires_at ?? 0) * 1000;
      token.error = undefined;
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      return token;
    },
    async session({ session, token: { user, error: tokenError } }) {
      console.log(session, user, tokenError);
      session.user = {
        // @ts-expect-error
        id: user?.id,
        // @ts-expect-error
        email: user?.email,
        // @ts-expect-error
        image: user?.image,
        // @ts-expect-error
        name: user?.name,
        // @ts-expect-error
        loginName: user?.loginName,
      };
      // @ts-expect-error
      session.clientId = process.env.ZITADEL_CLIENT_ID;
      // @ts-expect-error
      session.error = tokenError;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
