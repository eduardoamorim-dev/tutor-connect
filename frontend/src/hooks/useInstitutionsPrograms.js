import { useQuery } from "@tanstack/react-query";
import { getInstitutions, getInstitutionById } from "../api/instituicoes";
import { getPrograms, getProgramById, getMyCoordinatedPrograms } from "../api/programas";

/**
 * Hook to get all institutions
 */
export const useInstitutions = (filters = {}) => {
  return useQuery({
    queryKey: ["institutions", filters],
    queryFn: () => getInstitutions(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to get institution by ID
 */
export const useInstitution = (id) => {
  return useQuery({
    queryKey: ["institution", id],
    queryFn: () => getInstitutionById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to get all programs (optionally filtered by institution)
 */
export const usePrograms = (filters = {}) => {
  return useQuery({
    queryKey: ["programs", filters],
    queryFn: () => getPrograms(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get program by ID
 */
export const useProgram = (id) => {
  return useQuery({
    queryKey: ["program", id],
    queryFn: () => getProgramById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get programs coordinated by current user
 */
export const useMyCoordinatedPrograms = () => {
  return useQuery({
    queryKey: ["my-coordinated-programs"],
    queryFn: getMyCoordinatedPrograms,
    staleTime: 1000 * 60 * 5,
  });
};
