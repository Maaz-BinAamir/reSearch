"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchComponent from "../components/SearchComponent";
import BookmarkSidebar from "../components/BookmarkSidebar";

interface Article {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
}

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const toggleBookmark = (article: Article) => {
    const isBookmarked = bookmarks.some((b) => b.title === article.title);

    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter((b) => b.title !== article.title);
    } else {
      newBookmarks = [...bookmarks, article];
    }

    setBookmarks(newBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="relative overflow-hidden">
      <Button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 bg-beige flex items-center justify-center"
      >
        <Bookmark className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {showSidebar && (
          <BookmarkSidebar
            showSidebar={showSidebar}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
          />
        )}
      </AnimatePresence>

      <main className="flex min-h-screen flex-col items-center justify-center p-24 animate-fade-in">
        <h1 className="mb-8 text-5xl font-bold font-lobster text-primary animate-fade-in">
          reSearch
        </h1>
        <p className="mb-8 text-xl text-center font-lobster">
          Your gateway to scholarly articles
        </p>
        <SearchComponent
          toggleBookmark={toggleBookmark}
          bookmarks={bookmarks}
        />
      </main>
    </div>
  );
}
