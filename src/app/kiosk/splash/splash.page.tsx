import { Card } from '@/components/base/card';
import { Carousel, CarouselItem } from '@/app/kiosk/splash/_components/carousel';
import { Link } from '@remix-run/react';

export default function KioskSplashPage() {
  const coverPhotoUris = new Array(5).fill(undefined).map((_, i) => `/splash/${i}.jpg`);

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
          {coverPhotoUris.map((uri, index) => (
            <CarouselItem key={index}>
              <img
                src={uri}
                alt={'okładka'}
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
