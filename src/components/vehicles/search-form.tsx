'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState<DateRange | undefined>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (date?.from) params.set('from', format(date.from, 'yyyy-MM-dd'));
    if (date?.to) params.set('to', format(date.to, 'yyyy-MM-dd'));
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 rounded-lg bg-card p-6 shadow-lg sm:grid-cols-10"
    >
      <div className="relative sm:col-span-4">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter a location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="sm:col-span-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full h-12 justify-start text-left font-normal text-base',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="h-12 text-base sm:col-span-2">
        Search
      </Button>
    </form>
  );
}
