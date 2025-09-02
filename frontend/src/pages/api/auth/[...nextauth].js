import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// ---------------------------------------------------
// Refresh Access Token
// Called when the current access token is expired.
// Uses Azure AD's token endpoint + refresh_token to get a new one.
// ---------------------------------------------------
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
      refreshToken: refreshed.refresh_token ?? token.refreshToken, // fallback if none returned
    };
  } catch (error) {
    console.error("❌ Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export default NextAuth({
  // ---------------- Providers ----------------
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          // Request offline_access so we get refresh tokens
          scope: `openid profile email offline_access api://${process.env.AZURE_AD_CLIENT_ID}/access_as_user`,
        },
      },
    }),
  ],

  // ---------------- Callbacks ----------------
  callbacks: {
    /**
     * JWT callback
     * - Runs whenever a JWT is created/updated.
     * - Handles first login (save access + refresh tokens).
     * - Refreshes tokens when expired.
     */
    async jwt({ token, account }) {
      // First login → set token data
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;

        // Decode roles if present in JWT payload
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

      // If access token still valid → return as-is
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Otherwise refresh
      return await refreshAccessToken(token);
    },

    /**
     * Session callback
     * - Runs when session object is created.
     * - Adds accessToken and roles to session for frontend use.
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (!session.user) session.user = {};
      session.user.roles = token.roles || [];
      return session;
    },

    /**
     * signIn callback
     * - Runs on login attempt.
     * - Restricts access to company email domain only.
     */
    async signIn({ user }) {
      return user.email.endsWith("@ethanconradprop.com");
    },
  },
});
