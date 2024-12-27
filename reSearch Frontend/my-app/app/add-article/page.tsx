"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { ArrowUpCircle } from "lucide-react";

export default function AddArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addTime, setAddTime] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    url: "",
    keywords: "",
    citations: "",
    year: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        setFormData({
          title: jsonData.title || "",
          abstract: jsonData.abstract || "",
          url: jsonData.url || "",
          keywords: Array.isArray(jsonData.keywords)
            ? jsonData.keywords.join(", ")
            : "",
          citations: jsonData.n_citation?.toString() || "",
          year: jsonData.year?.toString() || "",
        });
        toast.success("File data loaded successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid JSON file format";
        toast.error(errorMessage);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddTime(null);

    const toastId = toast.loading("Adding article...");

    try {
      const payload = {
        title: formData.title,
        abstract: formData.abstract,
        year: parseInt(formData.year),
        keywords: formData.keywords.split(",").map((k) => k.trim()),
        n_citation: parseFloat(formData.citations),
        url: formData.url,
      };

      const response = await fetch("http://127.0.0.1:5000/api/add_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add article");
      }

      const data = await response.json();
      setAddTime(data.time_taken);
      toast.success(
        `Article added successfully in ${data.time_taken.toFixed(2)}s`,
        { id: toastId }
      );

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error adding article:", error);
      toast.error("Failed to add article", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b">
            <h1 className="text-3xl font-bold text-center">Add New Article</h1>
            {addTime !== null && (
              <div className="text-sm text-center text-muted-foreground mt-2">
                Document added in {addTime.toFixed(2)} seconds
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="px-8 py-6 border-b">
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg hover:border-primary transition-colors cursor-pointer group">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ArrowUpCircle className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="mt-2 text-sm text-muted-foreground group-hover:text-primary">
                Upload JSON file or fill the form below
              </span>
            </label>
          </div>

          {/* Form Section */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-gray-700">
                    URL
                  </Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleChange}
                    required
                    className="w-full focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="abstract" className="text-gray-700">
                    Abstract
                  </Label>
                  <Textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    required
                    className="w-full h-32 focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-gray-700">
                    Keywords (comma seperated)
                  </Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    required
                    placeholder="Comma-separated keywords"
                    className="w-full focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="citations" className="text-gray-700">
                      Citations
                    </Label>
                    <Input
                      id="citations"
                      name="citations"
                      type="number"
                      value={formData.citations}
                      onChange={handleChange}
                      required
                      className="w-full focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-gray-700">
                      Year
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleChange}
                      required
                      className="w-full focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                    Adding Article...
                  </div>
                ) : (
                  "Submit Article"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
