import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";
import { SearchResult } from "../types/search";

interface ResultItemProps {
  result: SearchResult;
  toggleBookmark?: (article: SearchResult) => void;
  isBookmarked?: boolean;
  isModal?: boolean;
}

export default function ResultItem({
  result,
  toggleBookmark,
  isBookmarked = false,
  isModal = false,
}: ResultItemProps) {
  const parseKeywords = (keywordString: string) => {
    try {
      const jsonString = keywordString
        .replace(/'/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : ["No keywords"];
    } catch (error) {
      return ["No keywords"];
      console.log(error);
    }
  };

  const keywords = result.keywords
    ? parseKeywords(result.keywords)
    : ["No keywords"];

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  let urls: string[] = [];
  try {
    const sanitizedUrl = result.url
      ?.trim()
      .replace(/^['"]|['"]$/g, "")
      .replace(/'/g, '"');

    if (sanitizedUrl) {
      // Try parsing as JSON array first
      try {
        const parsedUrls = JSON.parse(sanitizedUrl);
        urls = Array.isArray(parsedUrls) ? parsedUrls : [sanitizedUrl];
      } catch {
        // If not JSON, treat as single URL
        urls = [sanitizedUrl];
      }
      urls = urls.filter(isValidUrl);
    }
  } catch (error) {
    console.error("Error parsing URLs:", error);
  }

  const truncateAbstract = (text: string, wordLimit: number) => {
    const words = text.split(/\s+/);
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : text;
  };

  const truncatedAbstract = truncateAbstract(result.abstract || "", 100);

  return (
    <div
      className={`relative p-4 bg-secondary rounded-lg space-y-2 transition-all duration-300 ${
        !isModal && "hover:shadow-md hover:scale-[1.02]"
      }`}
    >
      {toggleBookmark && !isModal && (
        <button
          onClick={() => toggleBookmark(result)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
        >
          <Bookmark
            className={`h-5 w-5 ${
              isBookmarked ? "fill-primary" : "fill-none"
            } stroke-primary`}
          />
        </button>
      )}

      <h3 className="text-xl font-semibold pr-8">
        {result.title || "No Title"}
      </h3>
      <p className="text-muted-foreground">
        {truncatedAbstract || "Abstract not available"}
      </p>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index} variant="outline">
            {keyword}
          </Badge>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          <span className="font-bold">Citations:</span>{" "}
          {result.n_citation || "N/A"}
        </span>
        <span>
          <span className="font-bold">Year:</span> {result.year || "Unknown"}
        </span>
      </div>
      <div className="flex flex-col space-y-1">
        {urls.length > 0
          ? urls.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Link {index + 1}
              </a>
            ))
          : "No valid links available"}
      </div>
    </div>
  );
}
