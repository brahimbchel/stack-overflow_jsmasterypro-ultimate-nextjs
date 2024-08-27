// import Tags from '@/components/shared/Tags'
import QuestionCard from '@/components/cards/QuestionCard'
import HomeFilter from '@/components/home/HomeFilter'
import Filter from '@/components/shared/Filter'
import NoResult from '@/components/shared/NoResult'
import LocalSearchBar from '@/components/shared/search/LocalSearchBar'
import { Button } from '@/components/ui/button'
import { HomePageFilters } from '@/constants/filters'
import Link from 'next/link'
import React from 'react'

const Home = () => {
  // const questions = []
  const questions = [
    {
      _id: '1',
      title: 'How to start investing in stocks?',
      // tags: ['Investing', 'Stock Market'],
      tags: [
        { _id: 'tag1', name: 'Investing' },
        { _id: 'tag2', name: 'Stock Market' }
      ],
      // author: 'John Doe',
      author: {
        _id: 'author1',
        name: 'John Doe',
        picture: 'https://example.com/johndoe.jpg'
      },
      upvotes: 23,
      views: 345,
      // answers: 7,
      answers: [
        { _id: 'answer1', text: 'Start by learning the basics of stock market investing.', author: 'Jane Smith', createdAt: '2024-08-27T12:00:00Z' },
        { _id: 'answer2', text: 'Consider diversifying your portfolio.', author: 'Mark Johnson', createdAt: '2024-08-27T13:00:00Z' }
      ],
      // createdAt: '2024-08-27T10:00:00Z',
      createdAt: new Date('2024-08-24T09:45:00Z'),
    },
    {
      _id: '2',
      title: 'Best practices for digital marketing?',
      tags: [
        { _id: 'tag3', name: 'Digital Marketing' },
        { _id: 'tag4', name: 'SEO' },
        { _id: 'tag5', name: 'Social Media' }
      ],
      author: {
        _id: 'author2',
        name: 'Jane Smith',
        picture: 'https://example.com/janesmith.jpg'
      },
      upvotes: 45,
      views: 567,
      answers: [
        { _id: 'answer3', text: 'Focus on your target audience.', author: 'Alex Brown', createdAt: new Date('2024-08-25T16:00:00Z') },
        { _id: 'answer4', text: 'Use analytics to measure success.', author: 'Emily Davis', createdAt: new Date('2024-08-25T16:30:00Z') }
      ],
      createdAt: new Date('2024-08-25T15:30:00Z'),
    },
    {
      _id: '3',
      title: 'How to create engaging content for TikTok?',
      tags: [
        { _id: 'tag6', name: 'Social Media' },
        { _id: 'tag7', name: 'Content Creation' },
        { _id: 'tag8', name: 'TikTok' }
      ],
      author: {
        _id: 'author3',
        name: 'Alex Brown',
        picture: 'https://example.com/alexbrown.jpg'
      },
      upvotes: 12,
      views: 210,
      answers: [
        { _id: 'answer5', text: 'Use trending sounds and hashtags.', author: 'Jane Smith', createdAt: new Date('2024-08-24T10:00:00Z') },
        { _id: 'answer6', text: 'Engage with your audience in the comments.', author: 'Michael Clark', createdAt: new Date('2024-08-24T11:00:00Z') }
      ],
      createdAt: new Date('2024-08-24T09:45:00Z'),
    },
    // Add more questions as needed
  ];

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href='/ask-question' className='flex justify-end max-sm:w-full'>
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">Ask a Question</Button>
        </Link>
      </div>

      {/* <div className="">
        <LocalSearchBar />
        <Tags />
      </div> */}

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for questions"
          otherClasses="flex-1"
        />

        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <HomeFilter />

      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0
          ? questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
          : <NoResult
            title="There’s no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        }
      </div>
    </>
  )
}

export default Home