import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';

type SiteLogoProps = {
  onDark?: boolean;
  className?: string;
};

export function SiteLogo({ onDark = false, className }: SiteLogoProps) {
  return (
    <Link
      href='/'
      aria-label={`${siteConfig.name}, home`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 transition-opacity hover:opacity-80',
        className,
      )}
    >
      <Image
        src='/brand/omomoom-logo.png'
        alt={siteConfig.name}
        priority
        sizes='(min-width: 640px) 150px, 124px'
        width={150}
        height={150}
        className={cn('h-auto w-31 sm:w-50', onDark && 'invert')}
      />
    </Link>
  );
}
