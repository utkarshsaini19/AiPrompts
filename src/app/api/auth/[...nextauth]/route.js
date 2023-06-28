import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/database";
import User from "@/models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      try {
        await connectToDB();

        // console.log("Profile :",JSON.stringify(profile));

        // Check if user is already exists
        const userExists = await User.findOne({email:profile.email})

        // If not , create a new user
        if(!userExists)
        {
          await User.create({
            email:profile.email,
            username : profile.name.replace(" ","").toLowerCase(),
            image : profile.picture
          })
        }

        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    async session({ session }) {
      // console.log("Session :",JSON.stringify(session));
      const sessionUser = await User.findOne({email:session.user.email})
      session.user.id = sessionUser._id.toString();
      // console.log("Updated Session :",JSON.stringify(session));
      return session;
    },
  },
});

export { handler as GET, handler as POST };
