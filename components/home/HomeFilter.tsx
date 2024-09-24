"use client"

import { HomePageFilters } from '@/constants/filters'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { formUrlQuery } from '@/lib/utils'

const HomeFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [active, setActive] = useState('');

  const handleTypeClick = (itemValue: string) => {
    if (active === itemValue) {
      setActive("");

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: null
      })

      router.push(newUrl, { scroll: false });
    } else {
      setActive(itemValue);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'filter',
        value: itemValue.toLowerCase()
      })

      router.push(newUrl, { scroll: false });
    }
  }



  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          // onClick={(e) => setSearch(item.value)}
          onClickCapture={() => handleTypeClick(item.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${active === item.value
            ? 'bg-primary-100 text-primary-500'
            : 'bg-light-800 text-light-500'
            }`}
        >
          {item.name}
        </Button>
      ))}
    </div>
  )
}

export default HomeFilter