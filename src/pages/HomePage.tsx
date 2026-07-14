import { useState, useMemo } from "react";
import { Search, BookOpen, Video, ArrowRight, Clock } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { useVideos } from "../hooks/useVideos";
import { useRecentlyWatched, useAllProgress } from "../hooks/useWatchHistory";
import VideoCard from "../components/VideoCard";
import SkeletonCard from "../components/SkeletonCard";
import { Video as VideoType } from "../types";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { data: recentlyWatched } = useRecentlyWatched();
  const { data: allProgress } = useAllProgress();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Create a map of videoId -> progress percentage
  const progressMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (allProgress) {
      allProgress.forEach((p) => {
        map[p.videoId] = p.watchedPercentage;
      });
    }
    return map;
  }, [allProgress]);

  // Filter videos by search
  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    if (!searchQuery.trim()) return videos;
    const query = searchQuery.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
    );
  }, [videos, searchQuery]);

  // Get recently watched videos (only those with valid video data)
  const recentVideos = useMemo(() => {
    if (!recentlyWatched) return [];
    return recentlyWatched
      .filter((h) => h.videoId && typeof h.videoId === "object")
      .slice(0, 4);
  }, [recentlyWatched]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-surface page-enter">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-accent" />
            <span className="text-accent text-sm font-medium">Learning Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Good {getGreeting()}, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl">
            Continue your learning journey. Watch videos, create bookmarks, and
            track your progress.
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-card text-white placeholder-gray-400 text-sm focus:outline-none focus:border-accent focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recently Watched Section */}
        {recentVideos.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-primary">
                Recently Watched
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentVideos.map((history) => {
                const video = history.videoId as VideoType;
                return (
                  <div
                    key={history._id}
                    onClick={() => navigate(`/video/${video._id}`)}
                    className="bg-surface-card rounded-card shadow-card card-hover cursor-pointer overflow-hidden flex items-center gap-3 p-3"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/160x90/1a1a2e/e91e63?text=Video";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-primary line-clamp-1">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Left at {formatTime(history.lastTimestamp)}
                      </p>
                      <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              history.watchedPercentage,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All Videos Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-primary">
              {searchQuery ? "Search Results" : "All Videos"}
            </h2>
            {filteredVideos.length > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                ({filteredVideos.length} videos)
              </span>
            )}
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No videos found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Videos will appear here once added"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  progress={progressMap[video._id] || 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// Helper to get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default HomePage;
