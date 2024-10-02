"use server"

import Question, { IQuestion } from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import { CreateQuestionParams, DeleteQuestionParams, EditQuestionParams, GetQuestionByIdParams, GetQuestionsParams, QuestionVoteParams, RecommendedParams } from "./shared.types";
import Tag from "@/database/tag.model";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<IQuestion> = {};


    if(searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i")}},
        { content: { $regex: new RegExp(searchQuery, "i")}},
      ]
    }

    let sortOption = {}

    switch(filter) {
      case 'frequent':
        sortOption = { views: -1 }
        break
      case 'newest':
        sortOption = { createdAt: -1 }
        break
      case 'unanswered':
        query.answers = { $size: 0 }
        break
      default:
        break
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User }) // .populate({ path: 'answers', model: Answer })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOption)

      const totalQuestions = await Question.countDocuments(query);

      const isNext = totalQuestions > skipAmount + questions.length;
  
      return { questions, isNext };
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // Create the question
    const question = await Question.create({
      title,
      content,
      author
    });

    const tagDocuments = [];

    // Create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } }, 
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      )

      tagDocuments.push(existingTag._id)
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments }}
    })

    // Create an interaction record for the user's ask_question action
    await Interaction.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    })

    // Increment author's reputation by +5 for creating a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 }})

    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: 'tags', model: Tag, select: '_id name'})
      .populate({ path: 'author', model: User, select: '_id clerkId name picture'})

      return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if(hasupVoted) {
      updateQuery = { $pull: { upvotes: userId }}
    } else if (hasdownVoted) {
      updateQuery = { 
        $pull: { downvotes: userId },
        $push: { upvotes: userId }
      }
    } else {
      updateQuery = { $addToSet: { upvotes: userId }}
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

    if(!question) {
      throw new Error("Question not found");
    }

    // Increment author's reputation by +1/-1 for upvoting/revoking an upvote to the question
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -1 : 1}
    })

    // Increment author's reputation by +10/-10 for recieving an upvote/downvote to the question
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasupVoted ? -10 : 10}
    })

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    let updateQuery = {};

    if(hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId }}
    } else if (hasupVoted) {
      updateQuery = { 
        $pull: { upvotes: userId },
        $push: { downvotes: userId }
      }
    } else {
      updateQuery = { $addToSet: { downvotes: userId }}
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true });

    if(!question) {
      throw new Error("Question not found");
    }

    await User.findByIdAndUpdate(userId, { 
      $inc: { reputation: hasdownVoted ? -2 : 2 }
    })

    await User.findByIdAndUpdate(question.author, { 
      $inc: { reputation: hasdownVoted ? -10 : 10 }
    })

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}


export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, path } = params;

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId }});

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}


export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();

    const { questionId, title, content, path } = params;

    const question = await Question.findById(questionId).populate("tags");

    if(!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}


export async function getTopQuestions() {
  try {
    connectToDatabase();

    const questions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(4)

    return  questions 
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    await connectToDatabase();

    const { userId, page = 1, pageSize = 20, searchQuery } = params;

    // find user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("user not found");
    }

    const skipAmount = (page - 1) * pageSize;

    // Find the user's interactions
    const userInteractions = await Interaction.find({ user: user._id })
      .populate("tags")
      .exec();

    // Extract tags from user's interactions
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags);
      }
      return tags;
    }, []);

    // Get distinct tag IDs from user's interactions
    const distinctUserTagIds = [
      // @ts-ignore
      ...new Set(userTags.map((tag: any) => tag._id)),
    ];

    const query: FilterQuery<typeof Question> = {
      $and: [
        { 
          // @ts-ignore
          tags: { $in: distinctUserTagIds } 
        }, // Questions with user's tags
        { 
          // @ts-ignore
          author: { $ne: user._id } 
        }, // Exclude user's own questions
      ],
    };

    if (searchQuery) {
      query.$or = [
        { // @ts-ignore
          title: { $regex: searchQuery, $options: "i" } },
        { // @ts-ignore
          content: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const totalQuestions = await Question.countDocuments(query);

    const recommendedQuestions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize);

    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;

    return { questions: recommendedQuestions, isNext };
  } catch (error) {
    console.error("Error getting recommended questions:", error);
    throw error;
  }
}