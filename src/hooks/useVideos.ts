import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { Video } from "../types";

// Fetch all videos
export const useVideos = () => {
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const { data } = await api.get("/videos");
      return data;
    },
  });
};

// Fetch single video by id
export const useVideo = (id: string) => {
  return useQuery<Video>({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data } = await api.get(`/videos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
