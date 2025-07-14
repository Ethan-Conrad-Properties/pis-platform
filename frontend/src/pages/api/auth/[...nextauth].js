import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID, 
      authorization: { params: { scope: "openid profile email user.Read" } }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow ethanconradprop.com emails
      return user.email.endsWith("@ethanconradprop.com");
    },
  },
});