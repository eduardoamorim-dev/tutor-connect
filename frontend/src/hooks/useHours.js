import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHoursSummary,
  getMyHours,
  getPendingHours,
  approveHours,
  bulkApproveHours,
  downloadHoursPDF,
} from "../api/horas";

/**
 * Hook to get hours summary for a tutor in a specific program
 */
export const useHoursSummary = (programId) => {
  return useQuery({
    queryKey: ["hours-summary", programId],
    queryFn: () => getHoursSummary(programId),
    enabled: !!programId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get all hour registrations for authenticated tutor
 */
export const useMyHours = (filters = {}) => {
  return useQuery({
    queryKey: ["my-hours", filters],
    queryFn: () => getMyHours(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get pending hours for coordinator
 */
export const usePendingHours = (filters = {}) => {
  return useQuery({
    queryKey: ["pending-hours", filters],
    queryFn: () => getPendingHours(filters),
    staleTime: 1000 * 30, // 30 seconds for real-time updates
  });
};

/**
 * Hook to approve/reject hours
 */
export const useApproveHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, aprovado, observacao }) => approveHours(id, aprovado, observacao),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["pending-hours"] });
      queryClient.invalidateQueries({ queryKey: ["my-hours"] });
      queryClient.invalidateQueries({ queryKey: ["hours-summary"] });
    },
  });
};

/**
 * Hook to bulk approve hours
 */
export const useBulkApproveHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registroIds }) => bulkApproveHours(registroIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-hours"] });
      queryClient.invalidateQueries({ queryKey: ["my-hours"] });
      queryClient.invalidateQueries({ queryKey: ["hours-summary"] });
    },
  });
};

/**
 * Hook to download hours PDF
 */
export const useDownloadHoursPDF = () => {
  return useMutation({
    mutationFn: ({ programId, filename }) => downloadHoursPDF(programId, filename),
  });
};
