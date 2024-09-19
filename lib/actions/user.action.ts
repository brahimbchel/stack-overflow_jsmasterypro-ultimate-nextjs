"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose"
import { CreateUserParams, DeleteUserParams, GetSavedQuestionsParams, ToggleSaveQuestionParams, UpdateUserParams } from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
// import { FilterQuery } from "mongoose";
import Tag from "@/database/tag.model";

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

export async function getAllUser() {
  try {
    connectToDatabase();


    console.log("All Users ... ");

    const users = await User.find({})

    return { users };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if(!user) {
      throw new Error('User not found');
    }

    // Delete user from database
    // and questions, answers, comments, etc.

    // get user question ids
    // const userQuestionIds = await Question.find({ author: user._id}).distinct('_id');

    // delete user questions
    await Question.deleteMany({ author: user._id });

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if(!user) {
      throw new Error('User not found');
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if(isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(userId, 
        { $pull: { saved: questionId }},
        { new: true }
      )
    } else {
      // add question to saved
      await User.findByIdAndUpdate(userId, 
        { $addToSet: { saved: questionId }},
        { new: true }
      )
    }

    // Increment author's reputation

    revalidatePath(path);

  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    // const { clerkId, searchQuery } = params;
    const { clerkId } = params;

    
    // const query: FilterQuery<typeof Question> = searchQuery
    //   ? { title: { $regex: new RegExp(searchQuery, 'i') } }
    //   : { };

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      // match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: '_id clerkId name picture'}
      ]
    })

    if(!user) {
      throw new Error('User not found');
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}