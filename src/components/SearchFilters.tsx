import { Search, Filter, Calendar, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedTopics: string[];
  onTopicToggle: (topic: string) => void;
  availableTopics: string[];
}

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  sortBy,
  onSortChange,
  selectedTopics,
  onTopicToggle,
  availableTopics
}: SearchFiltersProps) => {
  const languages = [
    "All", "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", 
    "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Scala"
  ];

  const sortOptions = [
    { value: "stars", label: "Most Stars", icon: Star },
    { value: "updated", label: "Recently Updated", icon: Calendar },
    { value: "forks", label: "Most Forks", icon: Filter }
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-github-card border-github-border focus:border-github-primary"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Language Filter */}
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40 bg-github-card border-github-border">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48 bg-github-card border-github-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic Tags */}
      {availableTopics.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Popular Topics</h4>
          <div className="flex flex-wrap gap-2">
            {availableTopics.slice(0, 12).map((topic) => (
              <Badge
                key={topic}
                variant={selectedTopics.includes(topic) ? "default" : "outline"}
                className="cursor-pointer hover:bg-github-primary hover:text-white transition-smooth"
                onClick={() => onTopicToggle(topic)}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(selectedLanguage !== "All" || selectedTopics.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguage !== "All" && (
            <Badge variant="secondary" className="bg-github-primary/20 text-github-primary">
              {selectedLanguage}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLanguageChange("All")}
                className="ml-1 h-auto p-0 hover:bg-transparent"
              >
                ×
              </Button>
            </Badge>
          )}
          {selectedTopics.map((topic) => (
            <Badge key={topic} variant="secondary" className="bg-github-success/20 text-github-success">
              {topic}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTopicToggle(topic)}
                className="ml-1 h-auto p-0 hover:bg-transparent"
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};