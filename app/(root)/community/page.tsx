import UserCard from '@/components/cards/UserCard'
import CommunityFilter from '@/components/community/CommunityFilter'
import Filter from '@/components/shared/Filter'
import LocalSearchbar from '@/components/shared/search/LocalSearchBar'
import { UserFilters } from '@/constants/filters'
import { getAllUser } from '@/lib/actions/user.action'
import Link from 'next/link'
import React from 'react'

const page = async () => {
  const result = await getAllUser()

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Users</h1>
      </div>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/community"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for users"
          otherClasses="flex-1"
        />

        <Filter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>

      <CommunityFilter />


      <div className="mt-10 flex w-full flex-col gap-6 md:flex-row">
        {result.users.length > 0
          ? result.users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
            />
          ))
          :
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            <p>No users yet</p>
            <Link href="/sign-up" className="mt-2 font-bold text-accent-blue">
              Join to be the first!
            </Link>
          </div>
        }
      </div>
    </>
  )
}

export default page