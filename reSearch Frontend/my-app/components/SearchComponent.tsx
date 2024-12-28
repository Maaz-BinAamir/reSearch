"use client";

import { useState, useCallback, useEffect, useRef, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ResultItem from "./ResultItem";
import SkeletonLoader from "./SkeletonLoader";
import Link from "next/link";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SearchResult = {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
};

type SearchResponse = {
  output: SearchResult[];
  total: number;
};

const RESULTS_PER_PAGE = 10;

export default function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<"relevance" | "year" | "citations">(
    "relevance"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
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

  const performSearch = async (searchQuery: string, page: number = 1) => {
    setIsLoading(true);
    setResults([]);
    setFetchTime(null);
    setHasSearched(true);

    const startTime = performance.now();
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/process", {
        query: searchQuery,
        page: page,
        per_page: RESULTS_PER_PAGE,
      });
      if (response.status === 200) {
        const data: SearchResponse = response.data;
        setResults(data.output || []);
        setTotalResults(data.total);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setFetchTime(Math.round(performance.now() - startTime));
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(query, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setCurrentPage(1); // Reset to first page on new search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await performSearch(query, 1);
  };

  const getSortedResults = useCallback(() => {
    if (sortBy === "relevance") return results;

    return [...results].sort((a, b) => {
      if (sortBy === "year") {
        return b.year - a.year;
      }
      // citations
      return Number(b.n_citation) - Number(a.n_citation);
    });
  }, [results, sortBy]);

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
      ) : hasSearched ? (
        totalResults === 0 ? (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">
                Couldn&apos;t find any results  for &quot;{query}&quot;
              </h2>
              <p className="text-muted-foreground">
                Here are the top 10 most cited articles:
              </p>
            </div>
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
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold animate-fade-in">
                Search Results
              </h2>
              <Select
                value={sortBy}
                onValueChange={(value: "relevance" | "year" | "citations") =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="citations">Citations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ul className="space-y-4">
              {getSortedResults().map((result, index) => (
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
        )
      ) : null}

      {results.length > 0 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    currentPage > 1 && handlePageChange(currentPage - 1)
                  }
                  className={`transition-colors hover:bg-primary/90 hover:text-primary-foreground ${
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }`}
                />
              </PaginationItem>

              {[...Array(Math.ceil(totalResults / RESULTS_PER_PAGE))].map(
                (_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === Math.ceil(totalResults / RESULTS_PER_PAGE) ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                          className={`cursor-pointer transition-colors ${
                            page === currentPage
                              ? "hover:bg-primary/50"
                              : "hover:bg-primary/30"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink className="cursor-default">
                          ...
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                }
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    currentPage < Math.ceil(totalResults / RESULTS_PER_PAGE) &&
                    handlePageChange(currentPage + 1)
                  }
                  className={`transition-colors hover:bg-primary/90 hover:text-primary-foreground ${
                    currentPage >= Math.ceil(totalResults / RESULTS_PER_PAGE)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-8 text-center animate-fade-in animation-delay-800">
        <Link href="/add-article">
          <Button>Add New Article</Button>
        </Link>
      </div>
    </div>
  );
}
