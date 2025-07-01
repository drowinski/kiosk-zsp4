import type { Route } from './+types/splash.page';
import { Card } from '@/components/base/card';
import { Carousel, CarouselItem } from '@/app/kiosk/splash/_components/carousel';
import { Link, useRouteError } from 'react-router';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';
import { getAssetUri } from '@/features/assets/utils/uris';
import { assetRepository } from '@/features/assets/.server/assets.repository';
import { CircleExclamationIcon } from '@/components/icons';

export async function loader({ context: { logger } }: Route.LoaderArgs) {
  logger.info('Getting carousel entries...');
  const [assets, assetsOk, assetsError] = await tryAsync(
    assetRepository.getRandomAssets(5, { filters: { assetType: ['image'] } })
  );
  if (!assetsOk) {
    logger.error(assetsError);
    throw status(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { assets };
}

export default function KioskSplashPage({ loaderData: { assets } }: Route.ComponentProps) {
  return (
    <Link
      to={'/timeline'}
      className={'flex h-full cursor-default items-center gap-2'}
      aria-labelledby={'title-card'}
    >
      <main className={'relative flex h-full flex-grow items-center justify-center overflow-hidden'}>
        <Carousel
          intervalMs={5000}
          className={'absolute left-0 top-0 h-full w-full scale-110'}
        >
          {assets.map((asset) => (
            <CarouselItem key={asset.id}>
              <img
                src={getAssetUri(asset.fileName)}
                alt={asset.description ?? 'Brak opisu.'}
                className={'blur-sm'}
              />
            </CarouselItem>
          ))}
        </Carousel>
        <div className={'absolute flex flex-col gap-2 animate-scale-100-105-pulse'}>
          <Card
            id={'title-card'}
            className={'flex flex-col items-center bg-primary p-8 text-center text-primary-foreground'}
          >
            <span className={'mb-2 text-6xl font-extrabold uppercase'}>
              Izba
              <br />
              Pamięci
            </span>
            <span className={'text-3xl font-medium'}>
              Szkoły Podstawowej nr 4<br />w Augustowie
            </span>
          </Card>
          <Card
            className={
              'flex items-center justify-center bg-secondary text-xl font-extrabold uppercase text-secondary-foreground'
            }
          >
            Dotknij aby rozpocząć
          </Card>
        </div>
      </main>
    </Link>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return (
    <main className={'flex h-full w-full items-center justify-center'}>
      <Card>
        <span className={'inline-flex items-center gap-2 text-xl font-medium'}>
          <CircleExclamationIcon /> Wystąpił błąd
        </span>
      </Card>
    </main>
  );
}
