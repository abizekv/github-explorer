import { useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, GitBranch, Activity } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Repository {
  id: number;
  name: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  size: number;
}

interface RepoAnalyticsProps {
  repositories: Repository[];
}

export const RepoAnalytics = ({ repositories }: RepoAnalyticsProps) => {
  const chartRef = useRef<ChartJS<"bar", number[], string>>(null);

  // Prepare data for language distribution
  const languageData = repositories.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const languageChartData = {
    labels: Object.keys(languageData).slice(0, 6),
    datasets: [
      {
        data: Object.values(languageData).slice(0, 6),
        backgroundColor: [
          'hsl(217, 91%, 60%)',
          'hsl(150, 80%, 50%)',
          'hsl(45, 100%, 50%)',
          'hsl(0, 65%, 51%)',
          'hsl(270, 91%, 60%)',
          'hsl(180, 80%, 50%)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare data for stars distribution
  const topRepos = repositories
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10);

  const starsChartData = {
    labels: topRepos.map(repo => repo.name.length > 15 ? repo.name.substring(0, 15) + '...' : repo.name),
    datasets: [
      {
        label: 'Stars',
        data: topRepos.map(repo => repo.stargazers_count),
        backgroundColor: 'hsl(150, 80%, 50%)',
        borderColor: 'hsl(150, 80%, 60%)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(210, 40%, 98%)',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(222, 47%, 11%)',
        },
        ticks: {
          color: 'hsl(215, 20%, 65%)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(215, 20%, 65%)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'hsl(210, 40%, 98%)',
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'hsl(222, 47%, 11%)',
        titleColor: 'hsl(210, 40%, 98%)',
        bodyColor: 'hsl(210, 40%, 98%)',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
      },
    },
  };

  // Calculate summary stats
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
  const avgStars = Math.round(totalStars / repositories.length) || 0;

  const stats = [
    {
      label: "Total Stars",
      value: totalStars.toLocaleString(),
      icon: TrendingUp,
      color: "text-github-success"
    },
    {
      label: "Total Forks",
      value: totalForks.toLocaleString(),
      icon: GitBranch,
      color: "text-github-primary"
    },
    {
      label: "Total Watchers",
      value: totalWatchers.toLocaleString(),
      icon: Users,
      color: "text-github-warning"
    },
    {
      label: "Avg Stars",
      value: avgStars.toLocaleString(),
      icon: Activity,
      color: "text-github-danger"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-gradient-card border-github-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Stars Chart */}
        <Card className="bg-gradient-card border-github-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Top Repositories by Stars</h3>
          <div className="h-64">
            <Bar ref={chartRef} data={starsChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Language Distribution */}
        <Card className="bg-gradient-card border-github-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Language Distribution</h3>
          <div className="h-64">
            <Doughnut data={languageChartData} options={doughnutOptions} />
          </div>
        </Card>
      </div>
    </div>
  );
};