"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Question from "@/database/question.model";

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

    const {searchQuery, filter,  page = 1, pageSize = 10} = params

    const query : FilterQuery<ITag> = {}
    const skipAmount = (page - 1) * pageSize;

    if(searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') }},
      ]
    }

    let sortOption = {}
    
    switch(filter) {
      case 'recent':
        sortOption = { createdAt: -1 }
        break
      case 'old':
        sortOption = { createdAt: 1 }
        break
      case 'popular': 
          sortOption = { questions: -1 }   // query.answers = { $size: 0 } questions
        break
      case 'name': 
        sortOption = { name: 1 }
        break
      default:
      break
    }

    const tags = await Tag.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOption);

      const totalTags = await Tag.countDocuments(query);

      const isNext = totalTags > skipAmount + tags.length;

    return { tags, isNext }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    connectToDatabase();

    // const { tagId, page = 1, pageSize = 10, searchQuery } = params;
    const { tagId, searchQuery } = params;


    const tagFilter: FilterQuery<ITag> = { _id: tagId};

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' }}
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: 'tags', model: Tag, select: "_id name" },
        { path: 'author', model: User, select: '_id clerkId name picture'}
      ]
    })

    if(!tag) {
      throw new Error('Tag not found');
    }
    
    const questions = tag.questions;

    return { tagTitle: tag.name, questions };

  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function getTopTags() {
  try {
    connectToDatabase();

    const tags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" }}},
      { $sort: { numberOfQuestions: -1 }}, 
      { $limit: 5 }
    ])

    return tags 
  } catch (error) {
    console.log(error)
    throw error;
  }
}