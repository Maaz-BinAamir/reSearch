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
  // Parse keywords string into array
  const parseKeywords = (keywordString: string) => {
    try {
      // Remove single quotes and replace with double quotes for valid JSON
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

  // Function to validate if a string is a valid URL
  const isValidUrl = (url: string) => {
    const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return regex.test(url);
  };

  // Parse URLs into an array and validate them
  let urls: string[] = [];
  try {
    const sanitizedUrl = result.url
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .replace(/'/g, '"');
    const parsedUrls = JSON.parse(sanitizedUrl);
    urls = parsedUrls.filter(isValidUrl);
  } catch (error) {
    console.error("Error parsing URLs:", error);
  }

  // Function to truncate abstract if it exceeds 100 words
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
