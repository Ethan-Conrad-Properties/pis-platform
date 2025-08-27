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
      refreshToken: refreshed.refresh_token ?? token.refreshToken, // fallback if not returned
    };
  } catch (error) {
    console.error("❌ Error refreshing access token", error);
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
      // First login → set token data
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;

        // Decode roles from token if present
        try {
          const base64Url = account.access_token.split(".")[1];
          const buff = Buffer.from(
            base64Url.replace(/-/g, "+").replace(/_/g, "/"),
            "base64"
          );
          const payload = JSON.parse(buff.toString("utf-8"));
          token.roles = payload.roles || [];
        } catch {
          token.roles = [];
        }

        return token;
      }

      // If still valid → return as-is
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise refresh
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (!session.user) session.user = {};
      session.user.roles = token.roles || [];
      return session;
    },

    async signIn({ user }) {
      // Restrict to company email domain
      return user.email.endsWith("@ethanconradprop.com");
    },
  },
});
