"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ResultItem from "./ResultItem";
import SkeletonLoader from "./SkeletonLoader";
import Link from "next/link";
import axios from "axios";

type SearchResult = {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
};

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const getLastWord = (text: string) => {
    return text.trim().split(/\s+/).pop() || "";
  };

  const getQueryWithoutLastWord = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.length > 1 ? words.slice(0, -1).join(" ") + " " : "";
  };

  const scrollSelectedIntoView = useCallback(() => {
    if (selectedIndex >= 0 && suggestionItemsRef.current[selectedIndex]) {
      suggestionItemsRef.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    scrollSelectedIntoView();
  }, [selectedIndex, scrollSelectedIntoView]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case "Tab":
        if (selectedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
    }
  };

  const debouncedAutocomplete = useCallback(async (input: string) => {
    const lastWord = getLastWord(input);
    if (lastWord.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/autocomplete?prefix=${lastWord}`
      );
      setSuggestions(response.data);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only show suggestions if we're not currently loading results
    if (!isLoading) {
      timeoutRef.current = setTimeout(() => {
        debouncedAutocomplete(value);
      }, 300);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const prefix = getQueryWithoutLastWord(query);
    const newQuery = prefix + suggestion;
    setQuery(newQuery);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Trigger search immediately with the new query
    performSearch(newQuery);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setResults([]);
    setFetchTime(null);

    const startTime = performance.now();
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/process", {
        query: searchQuery,
      });
      if (response.status === 200) {
        setResults(response.data.output || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setFetchTime(Math.round(performance.now() - startTime));
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSearch(query);
  };

  useEffect(() => {
    suggestionItemsRef.current = suggestionItemsRef.current.slice(
      0,
      suggestions.length
    );
  }, [suggestions]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl animate-fade-in animation-delay-400">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for articles..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={(el) => {
                  suggestionItemsRef.current[index] = el;
                }}
                className={`px-4 py-2 cursor-pointer ${
                  index === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {getQueryWithoutLastWord(query) + suggestion}
              </div>
            ))}
          </div>
        )}
      </form>

      {fetchTime !== null && (
        <div className="mb-4 text-gray-500 text-sm">
          Results fetched in {fetchTime.toFixed(2)} ms
        </div>
      )}

      {isLoading ? (
        <SkeletonLoader />
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4 animate-fade-in">
            Search Results
          </h2>
          <ul className="space-y-4">
            {results.map((result, index) => (
              <li
                key={index}
                className={`animate-fade-in animation-delay-${
                  (index + 1) * 200
                }`}
              >
                <ResultItem result={result} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 text-center animate-fade-in animation-delay-800">
        <Link href="/add-article">
          <Button>Add New Article</Button>
        </Link>
      </div>
    </div>
  );
}
