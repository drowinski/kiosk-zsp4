import { useCallback, useState } from 'react';

export function useFilesWithObjectUrls(): [File[], string[], (files: File[]) => void] {
  const [files, _setFiles] = useState<File[]>([]);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  const setFiles = useCallback((filesOrFunc: File[] | ((prev: File[]) => File[])) => {
    _setFiles((prev) => {
      const files = typeof filesOrFunc === 'function' ? filesOrFunc(prev) : filesOrFunc;
      setObjectUrls((prev) => {
        for (const url of prev) {
          URL.revokeObjectURL(url);
        }
        return files.map((file) => URL.createObjectURL(file));
      });
      return files;
    });
  }, []);

  return [files, objectUrls, setFiles];
}
