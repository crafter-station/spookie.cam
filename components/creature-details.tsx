'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { generateCreatureDetails } from '@/app/(app)/catalog/actions/generate-creature';
import { readStreamableValue } from 'ai/rsc';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { HorrificCreatureCard } from './horrific-creature-card';

type Creature = {
  id: number;
  name: string | null;
  synopsis: string | null;
  location: string | null;
  time: string | null;
  caption: string | null;
  weather: string | null;
  cloudinary_public_id: string;
  effect_index: number;
  testimonials?: { content: string; author: string }[];
};

export function CreatureDetails({ creature }: { creature: Creature }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [creatureState, setCreatureState] = useState<Creature>(creature);
  const router = useRouter();
  const typewriterRef = useRef<HTMLAudioElement | null>(null);
  const returnSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    typewriterRef.current = new Audio('/typewriter-1.mp3');
    typewriterRef.current.loop = true;
    returnSoundRef.current = new Audio('/typewriter-return-1.mp3');
  }, []);

  const discoverCreature = async () => {
    setIsGenerating(true);
    if (typewriterRef.current) {
      typewriterRef.current.play();
    }

    const initialPrompt = `Create a spooky creature based on this image for our Halloween-themed catalog. ${creature.caption ? 'Caption: ' + creature.caption : ''} `;

    try {
      const { object } = await generateCreatureDetails(
        creatureState.id,
        creatureState.cloudinary_public_id,
        initialPrompt,
      );

      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject) {
          setCreatureState((prev) => ({ ...prev, ...partialObject }));
        }
      }
      console.log('Creature details generated:', creatureState);
      router.refresh();
    } catch (error) {
      console.error('Failed to generate creature details:', error);
    } finally {
      setIsGenerating(false);
      if (typewriterRef.current) {
        typewriterRef.current.pause();
        typewriterRef.current.currentTime = 0;
      }
      if (returnSoundRef.current) {
        returnSoundRef.current.play();
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-center font-vcr text-4xl font-bold text-red-600">
        {creatureState.name || 'Unnamed Horror'}
      </h1>
      <Card className="border-red-900">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:space-x-6">
              <div className="mb-6 lg:mb-0 lg:w-1/2">
                <HorrificCreatureCard
                  name={creatureState.name}
                  cloudinaryPublicId={creatureState.cloudinary_public_id}
                  effectIndex={creatureState.effect_index}
                  isLink={false}
                  showName={false}
                />
              </div>
              <div className="space-y-6 lg:w-1/2">
                {creatureState.synopsis ? (
                  <div className="space-y-4">
                    {creatureState.synopsis
                      .split('.')
                      .filter(Boolean)
                      .map((sentence, index) => (
                        <p
                          key={index}
                          className="font-vcr text-lg text-gray-300"
                        >
                          {sentence.trim() + '.'}
                        </p>
                      ))}
                  </div>
                ) : (
                  <p className="font-vcr text-lg italic text-gray-500">
                    No description available...
                  </p>
                )}
                <Button
                  onClick={discoverCreature}
                  disabled={isGenerating}
                  className="w-full bg-red-700 font-vcr text-white hover:bg-red-600"
                >
                  {isGenerating
                    ? 'Summoning Horror...'
                    : 'Discover the Creature'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(['location', 'time', 'weather'] as const).map((field) => (
                <Card key={field} className="border-red-900">
                  <CardHeader>
                    <CardTitle className="font-vcr text-sm uppercase text-red-400">
                      {field}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-vcr text-gray-300">
                    {creatureState[field] || 'Unknown'}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {creatureState.testimonials && creatureState.testimonials.length > 0 && (
        <Card className="mt-8 border-red-900">
          <CardHeader>
            <CardTitle className="font-vcr text-2xl text-red-600">
              Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {creatureState.testimonials.map((testimonial, index) => (
              <Card key={index} className="border-red-900">
                <CardContent className="p-4">
                  <p className="mb-2 font-vcr italic text-gray-300">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <p className="text-right font-vcr text-gray-500">
                    - {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
