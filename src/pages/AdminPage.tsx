import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Plus,
  Trash2,
  Video,
  Upload,
  Image,
  AlertTriangle,
  Play,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import axios from "axios";

interface AdminVideo {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
}

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Status states
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all videos for list
  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const { data } = await api.get("/admin/videos");
      setVideos(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title || !description || !videoFile || !thumbnailFile) {
      setError("All fields (including video and thumbnail files) are required");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("Requesting signed upload tokens...");

    try {
      // 1. Get Cloudinary signature from backend
      const { data: sigData } = await api.get("/admin/cloudinary-signature");
      const { signature, timestamp, cloudName, apiKey, folder } = sigData;

      // 2. Upload thumbnail directly to Cloudinary
      setUploadStatus("Uploading thumbnail image...");
      const thumbFormData = new FormData();
      thumbFormData.append("file", thumbnailFile);
      thumbFormData.append("api_key", apiKey);
      thumbFormData.append("timestamp", timestamp.toString());
      thumbFormData.append("signature", signature);
      thumbFormData.append("folder", folder);

      const thumbRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        thumbFormData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(Math.round(pct * 0.1));
            }
          },
        }
      );

      // 3. Upload video directly to Cloudinary
      setUploadStatus("Uploading video...");
      const videoFormData = new FormData();
      videoFormData.append("file", videoFile);
      videoFormData.append("api_key", apiKey);
      videoFormData.append("timestamp", timestamp.toString());
      videoFormData.append("signature", signature);
      videoFormData.append("folder", folder);

      const videoRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        videoFormData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(10 + Math.round(pct * 0.9));
            }
          },
        }
      );

      // 4. Save video record to database
      setUploadStatus("Saving video metadata...");
      await api.post("/admin/videos", {
        title,
        description,
        thumbnail: thumbRes.data.secure_url,
        videoUrl: videoRes.data.secure_url,
        duration: videoRes.data.duration,
        cloudinaryVideoId: videoRes.data.public_id,
        cloudinaryThumbnailId: thumbRes.data.public_id,
      });

      setSuccess("Video uploaded and published successfully!");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setThumbnailFile(null);
      // Reset file input elements manually
      const videoInput = document.getElementById("video-input") as HTMLInputElement;
      const thumbInput = document.getElementById("thumbnail-input") as HTMLInputElement;
      if (videoInput) videoInput.value = "";
      if (thumbInput) thumbInput.value = "";

      // Refresh list
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to upload. Verify your Cloudinary keys."
      );
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video? This will remove files from Cloudinary too.")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.delete(`/admin/videos/${videoId}`);
      setSuccess("Video deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      fetchVideos();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete video");
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-surface py-8 px-4 page-enter">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student Portal
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 bg-primary text-white p-6 rounded-card shadow-card">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Video Management</h1>
            <p className="text-sm text-gray-300">
              Upload new videos using Cloudinary storage and manage existing lessons.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-btn mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-btn mb-6 flex items-center gap-2 animate-[fadeIn_0.2s_ease]">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1 bg-surface-card rounded-card shadow-card p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-primary">Upload Video</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Learn React Hooks"
                  required
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a short summary of the lesson..."
                  required
                  rows={4}
                  disabled={uploading}
                  className="w-full px-4 py-2 border border-gray-200 rounded-btn text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Video File (MP4, WebM)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="video-input"
                    accept="video/*"
                    onChange={handleVideoChange}
                    required
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className="border-2 border-dashed border-gray-200 rounded-btn p-4 text-center hover:border-accent transition-colors bg-gray-50/50 flex flex-col items-center justify-center gap-1">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-medium text-primary">
                      {videoFile ? videoFile.name : "Choose Video File"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : "Up to 100MB"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Thumbnail Image (PNG, JPG)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="thumbnail-input"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    required
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                  />
                  <div className="border-2 border-dashed border-gray-200 rounded-btn p-4 text-center hover:border-accent transition-colors bg-gray-50/50 flex flex-col items-center justify-center gap-1">
                    <Image className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-medium text-primary">
                      {thumbnailFile ? thumbnailFile.name : "Choose Thumbnail"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {thumbnailFile ? `${(thumbnailFile.size / 1024).toFixed(1)} KB` : "High resolution image"}
                    </span>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-accent">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">
                    Please keep this tab open. Video upload may take a few moments.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-accent text-white py-2.5 rounded-btn font-semibold text-sm btn-hover shadow-btn hover:bg-accent-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Publish Lesson
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Videos List */}
          <div className="lg:col-span-2 bg-surface-card rounded-card shadow-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-primary">Managed Lessons</h2>
              <span className="text-xs text-gray-400">({videos.length} total)</span>
            </div>

            {loadingVideos ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-surface rounded-btn animate-pulse">
                    <div className="w-28 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No uploaded videos yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Upload files through the sidebar form to display them on the portal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video._id}
                    className="flex gap-4 p-3 bg-surface rounded-btn hover:bg-secondary-light/20 transition-colors group relative"
                  >
                    <div className="w-28 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-medium px-1 rounded flex items-center gap-0.5">
                        <Clock className="w-2 h-2" />
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-10">
                      <h3 className="text-sm font-semibold text-primary truncate">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        {video.description}
                      </p>
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-accent font-semibold hover:underline mt-1"
                      >
                        <Play className="w-2.5 h-2.5" />
                        View Cloudinary Resource
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(video._id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
