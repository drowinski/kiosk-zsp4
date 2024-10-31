import { Card } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { cn } from '@/utils/styles';

interface FilterControlsProps {
  className?: string;
}

export function FilterControls({ className }: FilterControlsProps) {
  return (
    <Card
      className={cn('flex items-center', className)}
    >
      <Input
        placeholder={'Szukaj'}
      />
    </Card>
  );
}
