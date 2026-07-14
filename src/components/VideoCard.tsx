import { useNavigate } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Video } from "../types";

interface VideoCardProps {
  video: Video;
  progress?: number; // 0 to 100
}

// Helper: format seconds to MM:SS
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoCard = ({ video, progress = 0 }: VideoCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-surface-card rounded-card shadow-card card-hover cursor-pointer overflow-hidden"
      onClick={() => navigate(`/video/${video._id}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/640x360/1a1a2e/e91e63?text=Video";
          }}
        />
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>
        {/* Play overlay on hover */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-300 flex items-center justify-center group">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-btn">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-primary text-sm line-clamp-1 mb-1">
          {video.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {video.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent h-full rounded-full progress-animate transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        {progress > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">
            {Math.round(progress)}% completed
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
