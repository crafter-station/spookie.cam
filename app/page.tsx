import FoggyBackground from '@/components/foggy-background';
import { HorrificImageFilter } from '@/components/horrific-image-filter';

export default function Home() {
  return (
    <>
      <FoggyBackground />
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Welcome to spookie.cam
        </h1>
        <HorrificImageFilter />
      </div>
    </>
  );
}
