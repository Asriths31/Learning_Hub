import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { Bookmark } from "../types";

// Fetch bookmarks for a video
export const useBookmarks = (videoId: string) => {
  return useQuery<Bookmark[]>({
    queryKey: ["bookmarks", videoId],
    queryFn: async () => {
      const { data } = await api.get(`/bookmarks/${videoId}`);
      return data;
    },
    enabled: !!videoId,
  });
};

// Create a new bookmark
export const useCreateBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmark: {
      videoId: string;
      title: string;
      timestamp: number;
    }) => {
      const { data } = await api.post("/bookmarks", bookmark);
      return data;
    },
    onSuccess: (_data, variables) => {
      // Refresh bookmarks list for this video
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", variables.videoId],
      });
    },
  });
};

// Delete a bookmark
export const useDeleteBookmark = (videoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmarkId: string) => {
      await api.delete(`/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", videoId] });
    },
  });
};
