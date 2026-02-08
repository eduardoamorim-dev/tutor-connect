import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import usersApi from "../api/services/usersApi";

export function useTutors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDisciplina, setSelectedDisciplina] = useState("all");
  const debounceRef = useRef(null);

  const {
    data: tutores = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["tutores"],
    queryFn: async () => {
      const res = await usersApi.getTutors();
      return res.data;
    },
  });

  // Debounce de 300ms na busca
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  const filteredTutores = useMemo(() => {
    return tutores.filter((tutor) => {
      const matchSearch =
        !debouncedSearch ||
        tutor.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tutor.disciplinas_dominadas?.some((d) =>
          d.disciplina.toLowerCase().includes(debouncedSearch.toLowerCase()),
        );

      const matchDisciplina =
        selectedDisciplina === "all" ||
        tutor.disciplinas_dominadas?.some((d) => d.disciplina === selectedDisciplina);

      return matchSearch && matchDisciplina;
    });
  }, [tutores, debouncedSearch, selectedDisciplina]);

  const allDisciplinas = useMemo(() => {
    return [
      ...new Set(tutores.flatMap((t) => t.disciplinas_dominadas.map((d) => d.disciplina))),
    ].sort();
  }, [tutores]);

  return {
    tutores: filteredTutores,
    allTutores: tutores,
    allDisciplinas,
    loading,
    searchTerm,
    setSearchTerm,
    selectedDisciplina,
    setSelectedDisciplina,
    fetchTutores: refetch,
    refresh: refetch,
  };
}
