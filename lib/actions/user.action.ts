"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose"

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    console.log("Searching for user with clerkId:", userId);
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log(`No user found with clerkId: ${userId}`);
      return null; // Return null or a specific value indicating no user was found
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}