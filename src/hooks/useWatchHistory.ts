import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import { WatchHistory, WatchProgress } from "../types";

// Get watch progress for a specific video
export const useWatchProgress = (videoId: string) => {
  return useQuery<{ lastTimestamp: number; watchedPercentage: number }>({
    queryKey: ["watchProgress", videoId],
    queryFn: async () => {
      const { data } = await api.get(`/watch-history/${videoId}`);
      return data;
    },
    enabled: !!videoId,
  });
};

// Update watch progress
export const useUpdateProgress = () => {
  return useMutation({
    mutationFn: async ({
      videoId,
      lastTimestamp,
      watchedPercentage,
    }: {
      videoId: string;
      lastTimestamp: number;
      watchedPercentage: number;
    }) => {
      const { data } = await api.put(`/watch-history/${videoId}`, {
        lastTimestamp,
        watchedPercentage,
      });
      return data;
    },
  });
};

// Get recently watched videos
export const useRecentlyWatched = () => {
  return useQuery<WatchHistory[]>({
    queryKey: ["recentlyWatched"],
    queryFn: async () => {
      const { data } = await api.get("/watch-history");
      return data;
    },
  });
};

// Get all progress for progress bars on cards
export const useAllProgress = () => {
  return useQuery<WatchProgress[]>({
    queryKey: ["allProgress"],
    queryFn: async () => {
      const { data } = await api.get("/watch-history/all/progress");
      return data;
    },
  });
};
