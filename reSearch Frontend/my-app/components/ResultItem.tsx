import { Badge } from "@/components/ui/badge";

type SearchResult = {
  title: string;
  abstract: string;
  keywords: string;
  n_citation: number;
  year: number;
  url: string;
};

export default function ResultItem({ result }: { result: SearchResult }) {
  const parseKeywords = (keywordString: string) => {
    try {
      const jsonString = keywordString
        .replace(/'/g, '"')
        .replace(/\s+/g, " ")
        .trim();
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : ["No keywords"];
    } catch (error) {
      console.error("Error parsing keywords:", error);
      return ["No keywords"];
    }
  };

  const keywords = result.keywords
    ? parseKeywords(result.keywords)
    : ["No keywords"];

  const parseUrls = (urlString: string): string[] => {
    // First try parsing as JSON array
    try {
      const sanitizedUrl = urlString
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .replace(/'/g, '"');
      const parsed = JSON.parse(sanitizedUrl);
      return Array.isArray(parsed) ? parsed : [urlString];
    } catch {
      // If not JSON, treat as single URL string
      return [urlString.trim()];
    }
  };

  const isValidUrl = (url: string) => {
    try {
      // Check if string starts with a protocol
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const urls = parseUrls(result.url || "").filter(isValidUrl);

  const truncateAbstract = (text: string, wordLimit: number) => {
    const words = text.split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const truncatedAbstract = truncateAbstract(result.abstract || "", 100);

  return (
    <div className="p-4 bg-secondary rounded-lg space-y-2 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      <h3 className="text-xl font-semibold">{result.title || "No Title"}</h3>
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
                className="text-blue-600 hover:underline text-sm break-all"
              >
                Link {index + 1}
              </a>
            ))
          : "No valid links available"}
      </div>
    </div>
  );
}
