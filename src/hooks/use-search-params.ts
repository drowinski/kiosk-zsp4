import { useSearchParams as _useSearchParams } from '@remix-run/react';
import { useCallback, useRef } from 'react';

// The built-in Remix useSearchParams hook returns an unstable setSearchParams function
// which causes unnecessary re-renders when utilized as a useEffect dependency.
// This wrapper prevents the re-renders from occurring.
export function useSearchParams(): ReturnType<typeof _useSearchParams> {
  const [searchParams, setSearchParams] = _useSearchParams();
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;
  const stableSetSearchParams = useCallback(
    (...args: Parameters<typeof setSearchParams>) => setSearchParamsRef.current(...args),
    []
  );
  return [searchParams, stableSetSearchParams];
}
