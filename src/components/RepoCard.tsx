import { Star, GitFork, Eye, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface RepoCardProps {
  repo: Repository;
}

export const RepoCard = ({ repo }: RepoCardProps) => {
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("github-bookmarks", []);
  const isBookmarked = bookmarks.includes(repo.id);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(id => id !== repo.id));
    } else {
      setBookmarks([...bookmarks, repo.id]);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gradient-card border-github-border hover:border-github-primary/30 transition-smooth group hover:shadow-glow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <img 
              src={repo.owner.avatar_url} 
              alt={repo.owner.login}
              className="w-8 h-8 rounded-full ring-2 ring-github-border"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">{repo.owner.login}/</span>
                <h3 className="font-semibold text-foreground truncate">{repo.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {repo.description || "No description available"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBookmark}
            className="ml-2 hover:bg-github-card"
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-github-success" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {repo.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {repo.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repo.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-github-success">
              <Star className="h-4 w-4" />
              <span>{formatCount(repo.stargazers_count)}</span>
            </div>
            <div className="flex items-center gap-1 text-github-primary">
              <GitFork className="h-4 w-4" />
              <span>{formatCount(repo.forks_count)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{formatCount(repo.watchers_count)}</span>
            </div>
          </div>
          {repo.language && (
            <Badge variant="outline" className="text-xs">
              {repo.language}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(repo.updated_at)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hover:bg-github-card group-hover:text-github-primary"
          >
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};