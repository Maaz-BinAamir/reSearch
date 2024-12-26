"use client";

import { useState } from "react";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setFetchTime(null); // Reset fetch time before a new search

    const startTime = performance.now(); // Start time measurement
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/process", {
        query: query,
      });

      if (response.status === 200) {
        setResults(response.data.output || []); // Ensure results is always an array
        console.log(response.data.output);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error("Unexpected error:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      const endTime = performance.now(); // End time measurement
      setFetchTime(Math.round(endTime - startTime)); // Calculate time taken
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in animation-delay-400">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search for articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>
      {fetchTime !== null && (
        <div className="mb-4 text-gray-500 text-sm">
          Results fetched in{" "}
          <span className="font-semibold">{fetchTime.toFixed(2)} ms</span>
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
