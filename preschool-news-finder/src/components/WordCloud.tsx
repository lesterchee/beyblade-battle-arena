"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface WordCloudProps {
    interests: string[];
    onAdd: (interest: string) => void;
    onRemove: (interest: string) => void;
}

export default function WordCloud({ interests, onAdd, onRemove }: WordCloudProps) {
    const [inputObj, setInputObj] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        if (inputObj.trim()) {
            onAdd(inputObj);
            setInputObj("");
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Input Area */}
            <div className="relative max-w-md w-full">
                <input
                    type="text"
                    value={inputObj}
                    onChange={(e) => setInputObj(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add an interest (e.g., Space, Dolphins)..."
                    className="w-full px-5 py-4 pl-6 pr-14 text-lg rounded-full border-2 border-primary/20 
                   focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none
                   placeholder:text-gray-400 bg-white shadow-sm text-foreground"
                />
                <button
                    onClick={addTag}
                    disabled={!inputObj.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary 
                   text-primary-foreground flex items-center justify-center
                   hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Add interest"
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
            </div>

            {/* Cloud Area */}
            <div className="flex flex-wrap gap-3">
                {interests.length === 0 && (
                    <p className="text-gray-400 italic py-2 pl-2">
                        No interests yet. Add some above to find news!
                    </p>
                )}
                {interests.map((interest, index) => (
                    <span
                        key={`${interest}-${index}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-lg font-medium
                     bg-white border-2 border-secondary text-secondary-foreground shadow-sm
                     animate-in fade-in zoom-in duration-200"
                    >
                        {interest}
                        <button
                            onClick={() => onRemove(interest)}
                            className="p-1 -mr-2 rounded-full hover:bg-neutral-100 text-gray-400 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${interest}`}
                        >
                            <X size={16} strokeWidth={3} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
