"use client";

import { useEffect, useState } from "react";
import ArticleCard, { Article } from "./ArticleCard";

export default function NewsFeed({ interests }: { interests: string[] }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (interests.length === 0) {
            setArticles([]);
            setError(null);
            return;
        }

        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                // Just join by comma for simplicity in this mock
                params.append("interests", interests.join(","));

                const res = await fetch(`/api/news?${params.toString()}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch news");
                }
                const data = await res.json();
                setArticles(data.articles);
            } catch (err) {
                console.error(err);
                setError("Something went wrong while finding stories. Please try again!");
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [interests]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 bg-gray-100 rounded-3xl animate-pulse border border-gray-200" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100 font-medium">
                {error}
            </div>
        );
    }

    if (interests.length > 0 && articles.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                No stories found for "{interests.join(", ")}". Try simpler words like "Space" or "Animals"!
            </div>
        );
    }

    if (interests.length === 0) {
        return (
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-secondary/30">
                <div className="text-4xl mb-4">🎈</div>
                <p className="text-xl text-gray-500 font-medium">
                    Add some interests above to see stories here!
                </p>
                <p className="text-sm text-gray-400 mt-2">Try "Space", "Animals", or "Robots"</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}
