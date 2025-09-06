import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Github, TrendingUp, Search, BarChart3 } from "lucide-react";
import { RepoCard } from "@/components/RepoCard";
import { SearchFilters } from "@/components/SearchFilters";
import { RepoAnalytics } from "@/components/RepoAnalytics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { githubApi, SearchParams, Repository } from "@/services/githubApi";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [sortBy, setSortBy] = useState("stars");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);

  // Fetch trending repositories
  const { data: repositories = [], isLoading, error } = useQuery({
    queryKey: ['repositories', searchQuery, selectedLanguage, sortBy, selectedTopics],
    queryFn: async () => {
      const params: SearchParams = {
        query: searchQuery,
        language: selectedLanguage,
        sort: sortBy as 'stars' | 'forks' | 'updated',
        per_page: 30
      };

      if (selectedTopics.length > 0) {
        const topicsQuery = selectedTopics.map(topic => `topic:${topic}`).join(' ');
        params.query = params.query ? `${params.query} ${topicsQuery}` : topicsQuery;
      }

      const response = await githubApi.searchRepositories(params);
      return response.items;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular topics
  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => githubApi.getPopularTopics(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  useEffect(() => {
    if (topics) {
      setAvailableTopics(topics);
    }
  }, [topics]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching repositories",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-github-border bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Github className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">GitHub Explorer</h1>
                <p className="text-sm text-muted-foreground">Discover trending open source projects</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-github-success" />
                <span>{repositories.length} repositories</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto bg-github-card border-github-border">
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            {/* Filters */}
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              sortBy={sortBy}
              onSortChange={setSortBy}
              selectedTopics={selectedTopics}
              onTopicToggle={handleTopicToggle}
              availableTopics={availableTopics}
            />

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-64 bg-github-card border border-github-border rounded-lg animate-pulse" />
                ))}
              </div>
            )}

            {/* Repository Grid */}
            {!isLoading && repositories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repositories.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && repositories.length === 0 && (
              <div className="text-center py-12">
                <Github className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No repositories found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLanguage("All");
                    setSelectedTopics([]);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {repositories.length > 0 ? (
              <RepoAnalytics repositories={repositories} />
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No data to analyze</h3>
                <p className="text-muted-foreground">Search for repositories to see analytics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;