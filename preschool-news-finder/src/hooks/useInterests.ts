"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "preschool-news-interests";

export function useInterests() {
    const [interests, setInterests] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setInterests(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load interests from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever interests change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(interests));
        }
    }, [interests, isLoaded]);

    const addInterest = (interest: string) => {
        const trimmed = interest.trim();
        if (trimmed && !interests.includes(trimmed)) {
            setInterests((prev) => [...prev, trimmed]);
        }
    };

    const removeInterest = (interestToRemove: string) => {
        setInterests((prev) => prev.filter((i) => i !== interestToRemove));
    };

    return { interests, addInterest, removeInterest, isLoaded };
}
