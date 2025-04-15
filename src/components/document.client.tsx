import { Document as ReactPdfDocument, Page, pdfjs } from 'react-pdf';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/styles';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/base/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export interface DocumentProps {
  src: string | File;
  initialPage?: number;
  visiblePages?: number;
  width?: number;
  height?: number;
  fill?: 'width' | 'height' | 'contain';
  controls?: boolean;
  className?: string;
}

export function Document({
  src,
  initialPage = 0,
  visiblePages = 1,
  width,
  height,
  fill,
  controls = false,
  className
}: DocumentProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageCount, setPageCount] = useState(0);
  const isPreviousPageAvailable = currentPage > 0;
  const isNextPageAvailable = currentPage < pageCount - 1;

  const [dimensions, setDimensions] = useState<[number | undefined, number | undefined]>([width, height]);
  const [wrapperClassName, setWrapperClassName] = useState<string>('');

  const resize = useCallback(() => {
    const wrapper = wrapperRef.current;
    const controls = controlsRef.current;
    if (!wrapper || !controls) return;
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const wrapperHeight = wrapper.getBoundingClientRect().height;
    const controlsHeight = controls.getBoundingClientRect().height;

    if (fill === 'width') {
      setDimensions([wrapperWidth, undefined]);
      setWrapperClassName('w-full max-h-fit');
    } else if (fill === 'height') {
      setDimensions([undefined, wrapperHeight - controlsHeight]);
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
          setDimensions([undefined, wrapperHeight - controlsHeight]);
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
      className={cn('overflow-hidden', className, wrapperClassName)}
    >
      <ReactPdfDocument
        file={src}
        loading={null}
        className={cn('overflow-hidden')}
        onLoadSuccess={(document) => {
          console.log(document, document.numPages);
          setPageCount(document.numPages);
        }}
      >
        {[...Array(visiblePages)].map((_, i) => (
          <Page
            key={i}
            pageNumber={currentPage + 1 + i}
            width={dimensions[0] ? dimensions[0] / visiblePages : undefined}
            height={dimensions[1]}
            loading={null}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </ReactPdfDocument>
      <div
        ref={controlsRef}
        className={'flex'}
        hidden={!controls}
      >
        <Button
          className={'grow rounded-none'}
          onClick={() => {
            setCurrentPage((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
          }}
          disabled={!isPreviousPageAvailable}
        >
          <ChevronLeftIcon />
        </Button>

        <Button
          className={'grow rounded-none'}
          onClick={() => {
            setCurrentPage((prev) => (prev + 1 < pageCount ? prev + 1 : prev));
          }}
          disabled={!isNextPageAvailable}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
