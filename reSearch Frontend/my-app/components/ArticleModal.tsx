import { SearchResult } from "../types/search";
import ResultItem from "./ResultItem";
import { X } from "lucide-react"; // Add this import

interface ArticleModalProps {
  article: SearchResult;
  isOpen: boolean;
  onClose: () => void;
  onBookmark?: (article: SearchResult) => void;
  isBookmarked?: boolean;
}

export default function ArticleModal({
  article,
  isOpen,
  onClose,
  onBookmark,
  isBookmarked = false,
}: ArticleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white p-10 rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto z-[101]">
        <ResultItem
          result={article}
          toggleBookmark={onBookmark}
          isBookmarked={isBookmarked}
          isModal
        />

        <button
          onClick={onClose}
          className="absolute top-0.5 right-0.5 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
