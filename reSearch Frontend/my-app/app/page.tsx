"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchComponent from '../components/SearchComponent';

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []); 

  const toggleBookmark = (article: any) => {
    const isBookmarked = bookmarks.some(b => b.title === article.title);
    
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.title !== article.title);
    } else {
      newBookmarks = [...bookmarks, article];
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
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
        <Bookmark className="h-5 w-5"/>
      </Button>

      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 h-screen w-96 bg-background/95 backdrop-blur shadow-xl p-4 overflow-y-auto z-40"
          >
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold">Bookmarked Articles</h2>
            </div>

            <div className="space-y-4">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark: any, index: number) => (
                  <div key={index} className="bg-card p-3 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{bookmark.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(bookmark)}
                      >
                        <X className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {bookmark.abstract?.substring(0, 100)}...
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center">
                  No bookmarked articles yet
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  
      <main className="flex min-h-screen flex-col items-center justify-center p-24 animate-fade-in">
        <h1 className="mb-8 text-4xl font-bold text-primary animate-fade-in">
          reSearch
        </h1>
        <p className="mb-8 text-xl text-center font-lobster">
          Your gateway to scholarly articles
        </p>
        <SearchComponent toggleBookmark={toggleBookmark} bookmarks={bookmarks} />
      </main>
    </div>
  );
}