import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ArticleModal from "./ArticleModal";
import { useState } from "react";

interface Article {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
}

interface BookmarkSidebarProps {
  showSidebar: boolean;
  bookmarks: Article[];
  toggleBookmark: (article: Article) => void;
}

export default function BookmarkSidebar({
  bookmarks,
  toggleBookmark,
}: BookmarkSidebarProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed right-0 top-0 bottom-0 w-96 bg-background/95 backdrop-blur shadow-xl flex flex-col z-40"
      >
        <div className="px-4 py-4 border-b">
          <h2 className="text-xl font-semibold">Bookmarked Articles</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-custom">
          <div className="space-y-4">
            {bookmarks.length > 0 ? (
              bookmarks.map((bookmark: Article, index: number) => (
                <div
                  key={index}
                  className="bg-card p-3 rounded-lg cursor-pointer hover:bg-card/80"
                  onClick={() => handleArticleClick(bookmark)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{bookmark.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(bookmark);
                      }}
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
        </div>
      </motion.div>

      {selectedArticle && (
        <ArticleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          article={selectedArticle}
          onBookmark={toggleBookmark}
          isBookmarked={true}
        />
      )}
    </>
  );
}
