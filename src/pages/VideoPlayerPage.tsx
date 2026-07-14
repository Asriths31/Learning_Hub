import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Plus,
  Trash2,
  Play,
  Clock,
  BookOpen,
} from "lucide-react";
import { useVideo } from "../hooks/useVideos";
import {
  useBookmarks,
  useCreateBookmark,
  useDeleteBookmark,
} from "../hooks/useBookmarks";
import { useWatchProgress, useUpdateProgress } from "../hooks/useWatchHistory";
import useAuth from "../hooks/useAuth";

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const VideoPlayerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Data fetching
  const { data: video, isLoading: videoLoading } = useVideo(id || "");
  const { data: bookmarks } = useBookmarks(id || "");
  const { data: watchProgress } = useWatchProgress(id || "");
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark(id || "");
  const updateProgress = useUpdateProgress();

  // Local state
  const [bookmarkTitle, setBookmarkTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [savedTimestamp, setSavedTimestamp] = useState(0);

  // Show continue watching dialog when progress data loads
  useEffect(() => {
    if (watchProgress && watchProgress.lastTimestamp > 5) {
      setSavedTimestamp(watchProgress.lastTimestamp);
      setShowContinueDialog(true);
    }
  }, [watchProgress]);

  // Auto-save progress every 5 seconds
  useEffect(() => {
    if (!id || !video) return;

    const interval = setInterval(() => {
      const videoEl = videoRef.current;
      if (videoEl && !videoEl.paused && videoEl.duration > 0) {
        const percentage = (videoEl.currentTime / videoEl.duration) * 100;
        updateProgress.mutate({
          videoId: id,
          lastTimestamp: videoEl.currentTime,
          watchedPercentage: Math.min(percentage, 100),
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, video]);

  // Track current time
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  // Tab visibility for blur effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Disable right-click on video
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".video-container")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Save bookmark
  const handleSaveBookmark = () => {
    if (!id || !videoRef.current) return;

    createBookmark.mutate({
      videoId: id,
      title: bookmarkTitle.trim() || "",
      timestamp: videoRef.current.currentTime,
    });

    setBookmarkTitle("");
  };

  // Jump to bookmark timestamp
  const handleJump = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
    }
  };

  // Continue watching handlers
  const handleContinue = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = savedTimestamp;
      videoRef.current.play();
    }
    setShowContinueDialog(false);
  };

  const handleStartOver = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setShowContinueDialog(false);
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Video not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-3 text-accent text-sm hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface page-enter">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </button>

        {/* Video Player */}
        <div
          className={`video-container relative bg-black rounded-card overflow-hidden shadow-card-hover no-select ${
            !isTabActive ? "video-blurred" : ""
          }`}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            className="w-full aspect-video"
            onTimeUpdate={handleTimeUpdate}
            onDragStart={(e) => e.preventDefault()}
          />

          {/* Watermark Overlay */}
          <div className="video-watermark">
            <div className="watermark-text">
              {user?.name}
              {"\n"}
              {user?.email}
              {"\n"}
              {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Continue Watching Dialog */}
        {showContinueDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-card shadow-card-hover p-6 max-w-sm w-full animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-primary">
                  Continue Watching?
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Continue from{" "}
                <span className="font-semibold text-accent">
                  {formatTime(savedTimestamp)}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-accent text-white py-2.5 rounded-btn font-semibold text-sm btn-hover shadow-btn hover:bg-accent-dark transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={handleStartOver}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-btn font-semibold text-sm btn-hover hover:bg-gray-200 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Details */}
        <div className="bg-surface-card rounded-card shadow-card p-5 mt-4">
          <h1 className="text-xl font-bold text-primary mb-2">{video.title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {video.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(video.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              Current: {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Add Bookmark Section */}
        <div className="bg-surface-card rounded-card shadow-card p-5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-primary">Add Bookmark</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={bookmarkTitle}
              onChange={(e) => setBookmarkTitle(e.target.value)}
              placeholder="Bookmark name (optional)"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
            <button
              onClick={handleSaveBookmark}
              disabled={createBookmark.isPending}
              className="bg-accent text-white px-5 py-2.5 rounded-btn font-semibold text-sm btn-hover shadow-btn hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Bookmark className="w-4 h-4" />
              Save Bookmark
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Current time: {formatTime(currentTime)} — The bookmark will save at
            this timestamp
          </p>
        </div>

        {/* Bookmarks List */}
        <div className="bg-surface-card rounded-card shadow-card p-5 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-base font-bold text-primary">Bookmarks</h2>
            {bookmarks && bookmarks.length > 0 && (
              <span className="text-xs text-gray-400">
                ({bookmarks.length})
              </span>
            )}
          </div>

          {!bookmarks || bookmarks.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No bookmarks yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Add bookmarks to save important timestamps
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="flex items-center justify-between p-3 bg-surface rounded-btn hover:bg-secondary-light/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bookmark className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {bookmark.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(bookmark.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleJump(bookmark.timestamp)}
                      className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-btn btn-hover hover:bg-accent-dark transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" fill="white" />
                      Jump
                    </button>
                    <button
                      onClick={() => deleteBookmark.mutate(bookmark._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
