import { useEffect, useState } from 'react';

export function useObjectUrl(object: Blob | MediaSource | undefined) {
  const [objectUrl, setObjectUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!object) return;
    const objectURL = URL.createObjectURL(object);
    setObjectUrl(objectURL);
    return () => {
      URL.revokeObjectURL(objectURL);
      setObjectUrl(undefined);
    };
  }, [object]);

  return objectUrl;
}
