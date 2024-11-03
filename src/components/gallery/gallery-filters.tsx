import { FilteredAssetsHookReturnType } from '@/features/assets/hooks/use-filtered-assets';
import { Card } from '@/components/base/card';
import { Input } from '@/components/base/input';

interface GalleryFiltersProps {
  setFilter: FilteredAssetsHookReturnType['setFilter'];
}

export function GalleryFilters({ setFilter }: GalleryFiltersProps) {
  return (
    <Card className={'flex gap-1'}>
      <Input
        placeholder={'Starsze niż...'}
        onInput={(event) =>
          setFilter(
            'minDate',
            Number(event.currentTarget.value) ? new Date(Number(event.currentTarget.value), 0, 1) : undefined
          )
        }
      />
      <Input
        placeholder={'Młodsze niż...'}
        onInput={(event) =>
          setFilter(
            'maxDate',
            Number(event.currentTarget.value) ? new Date(Number(event.currentTarget.value) + 1, 0, 1) : undefined
          )
        }
      />
    </Card>
  );
}
