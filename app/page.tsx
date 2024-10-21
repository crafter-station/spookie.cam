import SpookyImage from '@/components/spooky-image';

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Welcome to spookie.cam
      </h1>
      <SpookyImage />
    </div>
  );
}
