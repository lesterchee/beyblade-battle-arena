"use client";

import { useState, useEffect } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";

export interface Article {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    parentSummary: string;
    kidSummaryEn: string;
    kidSummaryZh: string;
}

export default function ArticleCard({ article }: { article: Article }) {
    const [speakingLang, setSpeakingLang] = useState<"en" | "zh" | null>(null);

    // Stop speech when component unmounts
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const toggleSpeech = (text: string, lang: "en" | "zh") => {
        if (speakingLang === lang) {
            window.speechSynthesis.cancel();
            setSpeakingLang(null);
        } else {
            window.speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === "en" ? "en-US" : "zh-CN";
            utterance.rate = 0.9; // Slightly slower for kids

            utterance.onend = () => setSpeakingLang(null);
            utterance.onerror = () => setSpeakingLang(null);

            setSpeakingLang(lang);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-secondary/20 flex flex-col gap-4 hover:shadow-md transition-shadow h-full">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-2" title={article.title}>
                    {article.title}
                </h3>
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary flex-shrink-0"
                    aria-label="Open original article"
                >
                    <ExternalLink size={18} />
                </a>
            </div>

            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    For Parents
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {article.parentSummary}
                </p>
            </div>

            <div className="mt-auto space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">English</span>
                        <button
                            onClick={() => toggleSpeech(article.kidSummaryEn, "en")}
                            className="p-2 rounded-full bg-white text-blue-400 hover:bg-blue-100 transition-colors shadow-sm"
                            aria-label={speakingLang === "en" ? "Stop reading English" : "Read in English"}
                        >
                            {speakingLang === "en" ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>
                    </div>
                    <p className="text-base font-medium text-gray-700 leading-relaxed">
                        {article.kidSummaryEn}
                    </p>
                </div>

                <div className="bg-pink-50/50 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">中文 (Chinese)</span>
                        <button
                            onClick={() => toggleSpeech(article.kidSummaryZh, "zh")}
                            className="p-2 rounded-full bg-white text-pink-400 hover:bg-pink-100 transition-colors shadow-sm"
                            aria-label={speakingLang === "zh" ? "Stop reading Chinese" : "Read in Chinese"}
                        >
                            {speakingLang === "zh" ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>
                    </div>
                    <p className="text-base font-medium text-gray-700 leading-relaxed">
                        {article.kidSummaryZh}
                    </p>
                </div>
            </div>
        </div>
    );
}
