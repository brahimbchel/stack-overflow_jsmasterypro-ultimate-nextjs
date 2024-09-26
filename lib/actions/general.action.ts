"use server"

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose"
import Question from "@/database/question.model";
import Answer from "@/database/answer.model";
import Tag from "@/database/tag.model";
import { SearchParams } from "./shared.types";


const SearchableTypes = ["question", "answer", "user", "tag"];

export async function globalSearch(params: SearchParams) {
  try {
    await connectToDatabase();

    const { query, type } = params;
    const regexQuery = { $regex: query, $options: "i" };

    let results = [];

    const modelsAndTypes = [
      { model: Question, searchField: 'title', type: 'question'},
      { model: User, searchField: 'name', type: 'user'},
      { model: Answer, searchField: 'content', type: 'answer'},
      { model: Tag, searchField: 'name', type: 'tag'},
    ]

    const typeLower = type?.toLowerCase();

    if(!typeLower || !SearchableTypes.includes(typeLower)) {
      // SEARCH ACROSS EVERYTHING

      for (const { model, searchField, type } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

          results.push(
            ...queryResults.map((item) => ({
              title: type === 'answer' 
              ? `Answers containing ${query}` 
              : item[searchField],
              type,
              id: type === 'user'
                ? item.clerkId
                : type==='answer'
                  ? item.question 
                  : item._id
              }))
          )
      }
    } else {
      // SEARCH IN THE SPECIFIED MODEL TYPE
      const modelInfo = modelsAndTypes.find((item) => item.type === type);

      console.log({modelInfo, type});
      if (!modelInfo) {
        throw new Error("Invalid search type");
      }

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((item) => ({
        title:
          type === "answer"
            ? `Answers containing ${query}`
            : item[modelInfo.searchField],
        type,
        id:
          type === "user"
            ? item.clerkId
            : type === "answer"
            ? item.question
            : item._id,
      }));
    }

    return JSON.stringify(results);
  } catch (error) {
    console.log(`Error fetching global results, ${error}`);
    throw error;
  }
}







// export async function globalSearch(params: any) {
//   try {
//     connectToDatabase()

//     const { query, type } = params;

//     let result

//     const queryUser: FilterQuery<IUser> = {};
//     const queryTag: FilterQuery<ITag> = {};
//     const queryQuestion: FilterQuery<IQuestion> = {};
//     const queryAnswer: FilterQuery<IAnswer> = {};


//     if(!type) {
//       // return 2 question 2 tags 2 ....
//       if(query) {
//         queryUser.$or = [
//           { name: { $regex: new RegExp(query, 'i') }},
//           { username: { $regex: new RegExp(query, 'i') }},
//         ]
//         queryTag.$or = [
//           { name: { $regex: new RegExp(query, 'i') }},
//         ]
//         queryQuestion.$or = [
//           { title: { $regex: new RegExp(query, 'i') }},
//           { content: { $regex: new RegExp(query, 'i') }},
//         ]
//         queryAnswer.$or = [
//           { content: { $regex: new RegExp(query, 'i') }},
//         ]
//       }

//       const users = await User.find(queryUser).limit(2)
//       const questions = await Question.find(queryQuestion).limit(2)
//       const answers = await Answer.find(queryAnswer).limit(2)
//       const tags = await Tag.find(queryTag).limit(2)

//       return { users, questions, answers, tags }
//     } else {
//       // return all the result from the type
//       switch(type){
//         case 'question': 
//           if(query) {
//           queryQuestion.$or = [
//             { title: { $regex: new RegExp(query, 'i') }},
//             { content: { $regex: new RegExp(query, 'i') }},
//           ]
//         }
//         questions = await Question.find(queryQuestion)
//         return { questions }
          
//           case 'answer': 
//           if(query) {
//             queryAnswer.$or = [
//               { content: { $regex: new RegExp(query, 'i') }},
//             ]
//           }
//           answers = await Answer.find(queryAnswer)
//           return {answers}
            
//           case 'user': 
//             if(query) {
//               queryUser.$or = [
//                 { name: { $regex: new RegExp(query, 'i') }},
//                 { username: { $regex: new RegExp(query, 'i') }},
//               ]
//             }
//             users = await User.find(queryUser)
//             return { users }
            
//           case 'tag': 
//           if(query) {
//           queryTag.$or = [
//             { name: { $regex: new RegExp(query, 'i') }},
//           ]
//         }
//         result = await Tag.find(queryTag)
//             break
//         default:
//           break
//       }
//       return { result }
//     }
//   } catch (err) {
//     console.log(err)
//   }
// } 
