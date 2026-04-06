import { Button } from '@kiosk-zsp4/shared/components/button';
import { Card } from '@kiosk-zsp4/shared/components/card';
import { useLogOut } from '@kiosk-zsp4/shared/features/auth/api/log-out';
import { useAuth } from '@kiosk-zsp4/shared/features/auth/hooks/use-auth';
import { Link } from '@kiosk-zsp4/shared/components/link';

export function DashboardPage() {
  const { logOut } = useLogOut();
  const { user } = useAuth();

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="gap-2">
        <h1 className="font-heading-lg">CMS</h1>
        <h2 className="font-heading-md">
          User: {user.username} (id: {user.id}, role: {user.role})
        </h2>
        <p className={'w-[50ch]'}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
          fermentum mi in justo congue, vel ullamcorper neque bibendum. Integer
          quis tortor consequat diam maximus lacinia sit amet a est. Fusce vel
          nulla consectetur dolor semper malesuada. Proin condimentum magna
          laoreet, pulvinar est ut, vulputate mi. Cras sollicitudin ullamcorper
          augue id.
        </p>
        <Link to={'/other'}>other</Link>
        <Button
          variant="primary"
          onClick={() => void logOut()}
        >
          Log out
        </Button>
      </Card>
    </div>
  );
}
