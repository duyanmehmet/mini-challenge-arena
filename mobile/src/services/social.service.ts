import api from "./api";
import type { Friend } from "../types/user.types";

export const socialService = {
  getFriends: async (): Promise<Friend[]> => {
    const res = await api.get("/social/friends");
    return res.data;
  },

  searchUsers: async (query: string) => {
    const res = await api.get("/social/search", { params: { q: query } });
    return res.data;
  },

  sendRequest: async (receiverId: string) => {
    const res = await api.post("/social/request", { receiverId });
    return res.data;
  },

  getPendingRequests: async () => {
    const res = await api.get("/social/requests");
    return res.data;
  },

  acceptRequest: async (friendshipId: string) => {
    const res = await api.post("/social/accept", { friendshipId });
    return res.data;
  },

  rejectRequest: async (friendshipId: string) => {
    const res = await api.post("/social/reject", { friendshipId });
    return res.data;
  },

  sendDuel: async (friendId: string, mode: string) => {
    const res = await api.post("/social/duel", { friendId, mode });
    return res.data;
  },

  // Aliases for backwards compatibility
  sendFriendRequest: async (receiverId: string) => {
    const res = await api.post("/social/request", { receiverId });
    return res.data;
  },

  acceptFriendRequest: async (friendshipId: string) => {
    const res = await api.post("/social/accept", { friendshipId });
    return res.data;
  },
};