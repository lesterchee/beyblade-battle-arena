"use client";

import { useInterests } from "@/hooks/useInterests";
import WordCloud from "@/components/WordCloud";
import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  const { interests, addInterest, removeInterest, isLoaded } = useInterests();

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans bg-background selection:bg-primary/20">
      <main className="flex flex-col gap-8 items-center sm:items-start max-w-4xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight text-center sm:text-left w-full drop-shadow-sm">
          Preschool News Finder 🎈
        </h1>
        <p className="text-xl text-foreground/80 text-center sm:text-left font-medium">
          Discover fun news for your little ones!
        </p>

        <div className="w-full grid gap-8">
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-secondary/20">
            <h2 className="text-2xl font-bold mb-4 text-secondary-foreground">Your Interests</h2>
            <div className="text-foreground/60 mb-4 font-medium">
              Type what you like (e.g., "Space", "Koalas") and press Enter!
            </div>
            <WordCloud
              interests={interests}
              onAdd={addInterest}
              onRemove={removeInterest}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent-foreground">Today's Stories</h2>
            <NewsFeed interests={interests} />
          </div>
        </div>
      </main>
    </div>
  );
}
