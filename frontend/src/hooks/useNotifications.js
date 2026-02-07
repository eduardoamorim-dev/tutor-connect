import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificacoesApi from "../api/services/notificacoesApi";

export function useNotifications() {
  const queryClient = useQueryClient();

  const {
    data: count = 0,
    refetch: refetchCount,
  } = useQuery({
    queryKey: ["notificacoes-count"],
    queryFn: async () => {
      const res = await notificacoesApi.count();
      return res.data.count;
    },
    refetchInterval: 30000, // Polling a cada 30s
  });

  const {
    data: notificacoes = [],
    isLoading: loading,
    refetch: fetchNotificacoes,
  } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const res = await notificacoesApi.list({ limit: 20 });
      return res.data;
    },
    enabled: false, // Only fetch when explicitly called
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    queryClient.invalidateQueries({ queryKey: ["notificacoes-count"] });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id) => notificacoesApi.markRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notificacoes"], (prev) =>
        prev?.map((n) => (n._id === id ? { ...n, lida: true } : n)),
      );
      queryClient.setQueryData(["notificacoes-count"], (prev) =>
        Math.max(0, (prev || 0) - 1),
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificacoesApi.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(["notificacoes"], (prev) =>
        prev?.map((n) => ({ ...n, lida: true })),
      );
      queryClient.setQueryData(["notificacoes-count"], 0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificacoesApi.deleteOne(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notificacoes"], (prev) => {
        const notif = prev?.find((n) => n._id === id);
        if (notif && !notif.lida) {
          queryClient.setQueryData(["notificacoes-count"], (c) =>
            Math.max(0, (c || 0) - 1),
          );
        }
        return prev?.filter((n) => n._id !== id);
      });
    },
  });

  const clearReadMutation = useMutation({
    mutationFn: () => notificacoesApi.deleteAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(["notificacoes"], (prev) =>
        prev?.filter((n) => !n.lida),
      );
    },
  });

  const markAsRead = useCallback(
    (id) => markReadMutation.mutate(id),
    [markReadMutation],
  );

  const markAllAsRead = useCallback(
    () => markAllReadMutation.mutate(),
    [markAllReadMutation],
  );

  const deleteNotification = useCallback(
    (id) => deleteMutation.mutate(id),
    [deleteMutation],
  );

  const clearRead = useCallback(
    () => clearReadMutation.mutate(),
    [clearReadMutation],
  );

  return {
    notificacoes,
    count,
    loading,
    fetchNotificacoes,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    refresh: invalidate,
  };
}
