import type { ComponentProps } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import { cn } from '@kiosk-zsp4/shared/styles/cn';

export interface LinkProps extends ComponentProps<typeof ReactRouterLink> {}

export function Link({ className, ...props }: LinkProps) {
  return <ReactRouterLink className={cn("text-primary w-fit", className)} {...props}/>
}
