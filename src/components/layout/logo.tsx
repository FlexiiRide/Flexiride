import Link from 'next/link';
import { Car } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="p-2 bg-primary text-primary-foreground rounded-lg group-hover:bg-primary/90 transition-colors">
        <Car className="h-6 w-6" />
      </div>
      <span className="text-xl font-bold font-headline text-foreground">
        {APP_NAME}
      </span>
    </Link>
  );
}
