// "use server"

// import Tag from "@/database/tag.model";
// import { connectToDatabase } from "../mongoose"


// export async function getTagByUserId(params: any) {
//   connectToDatabase()

//   const { userId } = params;

//   console.log("Searching for this user tags:", userId);
//     // const user = await User.findOne({ clerkId: userId });
  
//   const tag = await Tag.find({})

//   // filter the tags that have the userId 

//   const tagByUser = []
//   tag.filter(t => t.followers.includes(userId) ? tagByUser.push(t) : '')

//   return tagByUser
// }

"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findById(userId);

    if(!user) throw new Error("User not found");

    // Find interactions for the user and group by tags...
    // Interaction...

    return [ {_id: '1', name: 'tag'}, {_id: '2', name: 'tag2'}]
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();

    const tags = await Tag.find({});

    return { tags }
  } catch (error) {
    console.log(error);
    throw error;
  }
}