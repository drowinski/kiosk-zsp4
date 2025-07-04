import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/base/pagination';
import { useLocation, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';

interface ParamPaginationProps {
  itemCount: number;
  defaultPageSize?: number;
  maxVisiblePageLinks?: number;
}

export function ParamPagination({ itemCount, defaultPageSize = 3, maxVisiblePageLinks = 5 }: ParamPaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [previousLocation, setPreviousLocation] = useState(location);
  const currentPage = parseInt(searchParams.get('page')!) || 0;
  const pageSize = parseInt(searchParams.get('pageSize')!) || defaultPageSize;
  const pageCount = Math.ceil(itemCount / pageSize);
  const minPageNumber = Math.max(
    Math.min(currentPage - Math.floor(maxVisiblePageLinks / 2), pageCount - maxVisiblePageLinks),
    0
  );

  const previousPageSearchParams = new URLSearchParams(searchParams);
  previousPageSearchParams.set('page', (currentPage - 1).toString());
  const nextPageSearchParams = new URLSearchParams(searchParams);
  nextPageSearchParams.set('page', (currentPage + 1).toString());

  useEffect(() => {
    setPreviousLocation(location);
    if (location.search === previousLocation.search) return;
    const params = new URLSearchParams(location.search);
    const previousParams = new URLSearchParams(previousLocation.search);
    if (params.get('page') === '0') return;
    if (params.get('page') !== previousParams.get('page')) return;
    if (params.get('pageSize') !== previousParams.get('pageSize')) return;
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', '0');
      return newParams;
    });
  }, [location, previousLocation, setSearchParams]);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            isDisabled={currentPage <= 0}
            to={{ search: previousPageSearchParams.toString() }}
          />
        </PaginationItem>
        {minPageNumber > 0 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {[...Array(Math.min(maxVisiblePageLinks, pageCount))].map((_, i) => {
          const pageNumber = minPageNumber + i;

          const newParams = new URLSearchParams(searchParams);
          newParams.set('page', pageNumber.toString());

          return (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={pageNumber === currentPage}
                to={{ search: newParams.toString() }}
              >
                {pageNumber + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        {minPageNumber + maxVisiblePageLinks < pageCount && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            isDisabled={currentPage >= pageCount - 1}
            to={{ search: nextPageSearchParams.toString() }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
