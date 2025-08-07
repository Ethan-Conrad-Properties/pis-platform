import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: `openid profile email api://${process.env.AZURE_AD_CLIENT_ID}/access_as_user`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        // Decode roles from access token 
        try {
          const base64Url = account.access_token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const buff = Buffer.from(base64, 'base64');
          const jsonPayload = buff.toString('utf-8');
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
