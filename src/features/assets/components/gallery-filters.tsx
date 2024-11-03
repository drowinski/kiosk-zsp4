import { FilteredAssetsHookReturnType } from '@/features/assets/hooks/use-filtered-assets';
import { Card } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { cn } from '@/utils/styles';

interface GalleryFiltersProps {
  setFilter: FilteredAssetsHookReturnType['setFilter'];
  className?: string;
}

export function GalleryFilters({ setFilter, className }: GalleryFiltersProps) {
  return (
    <Card className={cn('flex gap-1 bg-secondary text-secondary-foreground', className)}>
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
