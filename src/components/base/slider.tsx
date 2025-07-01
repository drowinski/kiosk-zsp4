import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/utils/styles';
import PropTypes from 'prop-types';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-24 data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={
          'relative h-2 w-full grow overflow-hidden rounded-full bg-accent data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2'
        }
      >
        <SliderPrimitive.Range className={'absolute h-full bg-primary data-[orientation=vertical]:w-full'} />
      </SliderPrimitive.Track>
      {initialValue?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={
            'focus-visible:ring-ring block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          }
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = 'Slider';
Slider.propTypes = {
  className: PropTypes.string
};

export { Slider };
