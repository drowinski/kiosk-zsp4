import { Document as ReactPdfDocument, Page, pdfjs } from 'react-pdf';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/styles';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export interface DocumentProps {
  src: string | File;
  currentPageNumber?: number;
  pageCount?: number;
  width?: number;
  height?: number;
  fill?: 'width' | 'height' | 'contain';
  className?: string;
}

export function Document({ src, currentPageNumber = 1, pageCount = 1, width, height, fill, className }: DocumentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<[number | undefined, number | undefined]>([width, height]);
  const [wrapperClassName, setWrapperClassName] = useState<string>('');

  const resize = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const wrapperHeight = wrapper.getBoundingClientRect().height;

    if (fill === 'width') {
      setDimensions([wrapperWidth, undefined]);
      setWrapperClassName('w-full max-h-fit');
    } else if (fill === 'height') {
      setDimensions([undefined, wrapperHeight]);
      setWrapperClassName('max-w-fit h-full');
    } else if (fill === 'contain') {
      const parent = wrapper.parentElement;
      if (parent) {
        const parentStyle = window.getComputedStyle(parent);
        const parentWidth =
          parent.getBoundingClientRect().width -
          (parseFloat(parentStyle.paddingLeft) + parseFloat(parentStyle.paddingRight));
        const parentHeight =
          parent.getBoundingClientRect().height -
          (parseFloat(parentStyle.paddingTop) + parseFloat(parentStyle.paddingBottom));

        const parentAspectRatio = parentWidth / parentHeight;
        const wrapperAspectRatio = wrapperWidth / wrapperHeight;

        if (parentAspectRatio < wrapperAspectRatio) {
          setDimensions([wrapperWidth, undefined]);
          setWrapperClassName('w-full max-h-fit');
        } else {
          setDimensions([undefined, wrapperHeight]);
          setWrapperClassName('max-w-fit h-full');
        }
      } else {
        setDimensions([wrapperWidth, undefined]);
      }
    }
  }, [fill]);

  useEffect(() => {
    if (!fill || width || height) return;
    const wrapper = wrapperRef.current;
    const wrapperParent = wrapperRef.current?.parentElement;
    if (!wrapper || !wrapperParent) return;
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    resizeObserver.observe(wrapperParent);
    resize();
    return () => resizeObserver.disconnect();
  }, [fill, width, height, resize]);

  return (
    <div
      ref={wrapperRef}
      className={wrapperClassName}
    >
      <ReactPdfDocument
        file={src}
        loading={null}
        className={cn('overflow-hidden', className)}
      >
        {[...Array(pageCount)].map((_, i) => (
          <Page
            key={i}
            pageNumber={currentPageNumber + i}
            width={dimensions[0] ? dimensions[0] / pageCount : undefined}
            height={dimensions[1]}
            loading={null}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => console.log('loading')}
          />
        ))}
      </ReactPdfDocument>
    </div>
  );
}
