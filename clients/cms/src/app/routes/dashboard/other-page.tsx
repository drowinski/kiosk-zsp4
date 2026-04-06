import { Card } from '@kiosk-zsp4/shared/components/card';
import { Link } from '@kiosk-zsp4/shared/components/link';

export function OtherPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card><Link to={'/'}>go back</Link></Card>
    </div>
  );
}
