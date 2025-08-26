import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

async function refreshAccessToken(token) {
  try {
    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body: new URLSearchParams({
          client_id: process.env.AZURE_AD_CLIENT_ID,
          client_secret: process.env.AZURE_AD_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        }),
      }
    );

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: `openid profile email offline_access api://${process.env.AZURE_AD_CLIENT_ID}/access_as_user`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;

        // Decode roles from access token
        try {
          const base64Url = account.access_token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const buff = Buffer.from(base64, "base64");
          const jsonPayload = buff.toString("utf-8");
          const payload = JSON.parse(jsonPayload);
          token.roles = payload.roles || [];
        } catch (e) {
          token.roles = [];
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      // Add roles to session.user for easy access
      if (!session.user) session.user = {};
      session.user.roles = token.roles || [];
      return session;
    },
    async signIn({ user }) {
      // Only allow ethanconradprop.com emails
      return user.email.endsWith("@ethanconradprop.com");
    },
  },
});
