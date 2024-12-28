import { Badge } from "@/components/ui/badge";
import { Bookmark } from "lucide-react";

type SearchResult = {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
};

type ResultItemProps = {
  result: SearchResult;
  toggleBookmark?: (article: SearchResult) => void;
  bookmarks?: SearchResult[];
};

export default function ResultItem({ result, toggleBookmark, bookmarks = [] }: ResultItemProps) {
  const isBookmarked = bookmarks.some(b => b.title === result.title);

  const parseKeywords = (keywordString: string) => {
    try {
      const jsonString = keywordString.replace(/'/g, '"').replace(/\s+/g, " ").trim();
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : ["No keywords"];
    } catch (error) {
      return ["No keywords"];
    }
  };

  const keywords = result.keywords ? parseKeywords(result.keywords) : ["No keywords"];

  const isValidUrl = (url: string) => {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
  };

  let urls: string[] = [];
  try {
    const sanitizedUrl = result.url.trim().replace(/^['"]|['"]$/g, "").replace(/'/g, '"');
    const parsedUrls = JSON.parse(sanitizedUrl);
    urls = parsedUrls.filter(isValidUrl);
  } catch (error) {
    console.error("Error parsing URLs:", error);
  }

  const truncateAbstract = (text: string, wordLimit: number) => {
    const words = text.split(/\s+/);
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  const truncatedAbstract = truncateAbstract(result.abstract || "", 100);

  return (
    <div className="relative p-4 bg-secondary rounded-lg space-y-2 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      <button
        onClick={() => toggleBookmark?.(result)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
      >
        <Bookmark
          className={`h-5 w-5 ${isBookmarked ? 'fill-primary' : 'fill-none'} stroke-primary`}
        />
      </button>

      <h3 className="text-xl font-semibold pr-8">{result.title || "No Title"}</h3>
      <p className="text-muted-foreground">{truncatedAbstract || "Abstract not available"}</p>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <Badge key={index} variant="outline">{keyword}</Badge>
        ))}
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Citations: {result.n_citation || "N/A"}</span>
        <span>Year: {result.year || "Unknown"}</span>
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