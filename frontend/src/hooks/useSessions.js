import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import sessoesApi from "../api/services/sessoesApi";

export function useSessions() {
  const queryClient = useQueryClient();

  const {
    data: sessoes = [],
    isLoading: loading,
    refetch: fetchSessoes,
  } = useQuery({
    queryKey: ["sessoes"],
    queryFn: async () => {
      const res = await sessoesApi.getMinhasSessoes();
      return res.data;
    },
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["sessoes"] });
  }, [queryClient]);

  const confirmarMutation = useMutation({
    mutationFn: (id) => sessoesApi.confirmar(id),
    onSuccess: () => {
      toast.success("Sessão confirmada com sucesso!");
      invalidate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Erro ao confirmar sessão");
    },
  });

  const concluirMutation = useMutation({
    mutationFn: (id) => sessoesApi.concluir(id),
    onSuccess: () => {
      toast.success("Sessão concluída com sucesso!");
      invalidate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Erro ao concluir sessão");
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }) => sessoesApi.cancelar(id, motivo),
    onSuccess: () => {
      toast.success("Sessão cancelada com sucesso!");
      invalidate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Erro ao cancelar sessão");
    },
  });

  const avaliarMutation = useMutation({
    mutationFn: ({ sessaoId, nota, comentario }) =>
      sessoesApi.avaliar({ sessaoId, nota, comentario }),
    onSuccess: () => {
      toast.success("Avaliação enviada com sucesso!");
      invalidate();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Erro ao enviar avaliação");
    },
  });

  const confirmar = useCallback(
    async (id) => {
      await confirmarMutation.mutateAsync(id);
    },
    [confirmarMutation],
  );

  const concluir = useCallback(
    async (id) => {
      await concluirMutation.mutateAsync(id);
    },
    [concluirMutation],
  );

  const cancelar = useCallback(
    async (id, motivo) => {
      try {
        await cancelarMutation.mutateAsync({ id, motivo });
        return true;
      } catch {
        return false;
      }
    },
    [cancelarMutation],
  );

  const avaliar = useCallback(
    async (sessaoId, nota, comentario) => {
      try {
        await avaliarMutation.mutateAsync({ sessaoId, nota, comentario });
        return true;
      } catch {
        return false;
      }
    },
    [avaliarMutation],
  );

  return {
    sessoes,
    loading,
    fetchSessoes,
    confirmar,
    concluir,
    cancelar,
    avaliar,
    refresh: fetchSessoes,
  };
}
