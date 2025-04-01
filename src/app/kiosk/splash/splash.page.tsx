import type { Route } from './+types/splash.page';
import { Card } from '@/components/base/card';
import { Carousel, CarouselItem } from '@/app/kiosk/splash/_components/carousel';
import { Link } from 'react-router';
import { tryAsync } from '@/utils/try';
import { status, StatusCodes } from '@/utils/status-response';
import { getAssetUri } from '@/features/assets/utils/uris';
import { assetRepository } from '@/features/assets/assets.repository';

export async function loader({ context: { logger } }: Route.LoaderArgs) {
  logger.info('Getting carousel entries...');
  const [assets, assetsOk, assetsError] = await tryAsync(assetRepository.getRandomAssets(5));
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
      <div className={'relative flex h-full flex-grow items-center justify-center overflow-hidden'}>
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
        <div className={'absolute flex flex-col gap-2'}>
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
      </div>
    </Link>
  );
}
