import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/styles';

interface SeamlessInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SeamlessInput = React.forwardRef<HTMLDivElement, SeamlessInputProps>(
  ({ defaultValue, onChange, className, ...props }, ref) => {
    const [content, setContent] = useState(defaultValue);
    const [width, setWidth] = useState(0);
    const spanRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const span = spanRef.current;
      if (!span) return;
      setWidth(span.offsetWidth + span.offsetHeight * 0.8);
    }, [content]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setContent(event.target.value);
    };

    return (
      <div
        ref={ref}
        className={cn('transition-colors duration-200 hover:text-secondary', className)}
      >
        <span
          className={'pointer-events-none absolute opacity-0'}
          ref={spanRef}
        >
          {content}
        </span>
        <input
          type={'text'}
          style={{ width }}
          onChange={(event) => {
            handleChange(event);
            onChange && onChange(event);
          }}
          className={'bg-transparent p-0 focus-visible:outline-none'}
          defaultValue={defaultValue}
          {...props}
        />
      </div>
    );
  }
);
SeamlessInput.displayName = 'SeamlessInput';
