// User type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

// Auth response from login/register
export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string;
}

// Video type
export interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  createdAt: string;
}

// Bookmark type
export interface Bookmark {
  _id: string;
  userId: string;
  videoId: string;
  title: string;
  timestamp: number;
  createdAt: string;
}

// Watch history type
export interface WatchHistory {
  _id: string;
  userId: string;
  videoId: string | Video;
  lastTimestamp: number;
  watchedPercentage: number;
  lastWatchedAt: string;
}

// Watch progress (simplified)
export interface WatchProgress {
  videoId: string;
  watchedPercentage: number;
  lastTimestamp: number;
}
