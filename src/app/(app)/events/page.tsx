import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoveUpRight, Plus } from 'lucide-react'
import React from 'react'

const categories = [
    "All","Today","Academics", "Cultural","Sports","Workshops","Near me"
]

export default function page() {
  return (
    <div className='flex flex-1 flex-col px-6 pt-8 gap-4 '>
        {/* nav of event */}
      <div className='flex flex-row justify-between'>
        <span className='font-semibold text-xl text-foreground'>Events</span>
        <Button>
            <Plus/> Add event <MoveUpRight/>
        </Button>
      </div>
      <Input className='w-full self-center h-10' placeholder='Search Events,Clubs,Venus...'/>
      <div className='flex flex-row gap-3'>
        {categories.map((cat,i) => (
            <div key={i} className='border border-border rounded-lg text-slate-200 text-sm font-light px-2 py-1 first:bg-accent first:text-accent-foreground'>{cat}</div>
        ))}
      </div>
      <div className='flex flex-col gap-3'>
        {/* Event */}
        <span className='text-muted-foreground'>TODAY — MARCH 14</span>
        <div className='flex flex-row px-6 py-4 items-center gap-4 bg-card border border-border rounded-md'>
            <div>
              <div className='bg-muted inline-flex flex-col px-3.5 py-2.5 rounded-lg'>
                <span className='text-muted-foreground'>MAR</span>
                <span>14</span>
              </div>
            </div>
            <div className='flex-1 flex flex-col items-start w-fit'>
              <div className='flex gap-4 items-center justify-between'>
                <span>Hackathon kickoff</span>
                <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    Live Now
                </Badge>
              </div>
              <div className='text-sm text-muted-foreground items-center justify-between'>
                <span>3:00 pm - 5:00 pm</span>
                <span className='ml-2'>Auditorium Hall</span>
              </div>
              <div className='flex items-center text-sm text-muted-foreground gap-3'>
                <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    Academic
                </Badge>
                <span className='ml-auto'>120 attending</span>
              </div>
            </div>
            <div className='ml-auto flex justify-end font-light'>
              <MoveUpRight/>
            </div>
        </div>
      </div>
    </div>
  )
}
