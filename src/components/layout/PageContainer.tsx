import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Whether to apply navbar top padding (default: true) */
  withNavbarPadding?: boolean;
  /** Max width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * Standard page container with consistent navbar spacing.
 */
export const PageContainer = ({
  children,
  className,
  withNavbarPadding = true,
  maxWidth = '6xl',
}: PageContainerProps) => {
  // Fixed padding - no more dynamic progress bar
  const navbarPaddingClass = 'pt-[86px] sm:pt-24';

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6',
        withNavbarPadding && navbarPaddingClass,
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
