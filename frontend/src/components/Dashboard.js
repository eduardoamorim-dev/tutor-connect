import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "./ui/badge";
import { Calendar, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useSessions } from "../hooks/useSessions";
import { useTutors } from "../hooks/useTutors";
import usersApi from "../api/services/usersApi";
import sessoesApi from "../api/services/sessoesApi";

import TutorSearchTab from "./dashboard/TutorSearchTab";
import SessionsTab from "./dashboard/SessionsTab";
import TutorDetailsModal from "./dashboard/TutorDetailsModal";
import ScheduleModal from "./dashboard/ScheduleModal";
import RateModal from "./dashboard/RateModal";
import CancelModal from "./dashboard/CancelModal";
import TutorCardSkeleton from "./dashboard/TutorCardSkeleton";
import HoursTrackingCard from "./hours/HoursTrackingCard";

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("tutores");

  // Tutores via React Query
  const {
    tutores: filteredTutores,
    allDisciplinas,
    loading: tutoresLoading,
    searchTerm,
    setSearchTerm,
    selectedDisciplina,
    setSelectedDisciplina,
  } = useTutors();

  // Sessions via React Query
  const {
    sessoes,
    loading: sessoesLoading,
    confirmar,
    concluir,
    cancelar,
    avaliar,
  } = useSessions();

  // Modal states
  const [showDetalhesTutor, setShowDetalhesTutor] = useState(false);
  const [tutorDetalhes, setTutorDetalhes] = useState(null);
  const [avaliacoesTutor, setAvaliacoesTutor] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

  const [showAgendamento, setShowAgendamento] = useState(false);
  const [tutorSelecionado, setTutorSelecionado] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);

  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [sessaoParaAvaliar, setSessaoParaAvaliar] = useState(null);

  const [showCancelamento, setShowCancelamento] = useState(false);
  const [sessaoParaCancelar, setSessaoParaCancelar] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "sessoes") {
      setActiveTab("sessoes");
    }
  }, [searchParams]);

  // Tutor details
  const abrirDetalhesTutor = useCallback(async (tutor) => {
    setTutorDetalhes(tutor);
    setShowDetalhesTutor(true);
    setLoadingAvaliacoes(true);
    try {
      const res = await sessoesApi.getAvaliacoesTutor(tutor._id);
      setAvaliacoesTutor(res.data);
    } catch {
      setAvaliacoesTutor([]);
    } finally {
      setLoadingAvaliacoes(false);
    }
  }, []);

  // Scheduling
  const abrirModalAgendamento = useCallback(async (tutor) => {
    setTutorSelecionado(tutor);
    setShowAgendamento(true);
    setShowDetalhesTutor(false);

    // Always fetch fresh availability data to prevent double-booking
    try {
      setLoadingDisponibilidade(true);
      const res = await usersApi.getTutorDisponibilidade(tutor._id);
      setDisponibilidades(res.data);
    } catch (error) {
      console.error("Error fetching availability:", error);
      setDisponibilidades([]);
      toast.error("Erro ao carregar disponibilidade do tutor");
    } finally {
      setLoadingDisponibilidade(false);
    }
  }, []);

  const handleAgendar = useCallback(
    async ({ tutorId, disciplina, slot, observacoes }) => {
      const dataSlot = new Date(slot.data);
      const [hi, mi] = slot.horario_inicio.split(":").map(Number);
      const [hf, mf] = slot.horario_fim.split(":").map(Number);

      // Use hora local (não UTC) para funcionar com timezone brasileiro
      const data_hora_inicio = new Date(
        dataSlot.getFullYear(),
        dataSlot.getMonth(),
        dataSlot.getDate(),
        hi,
        mi,
        0,
        0
      );

      const data_hora_fim = new Date(
        dataSlot.getFullYear(),
        dataSlot.getMonth(),
        dataSlot.getDate(),
        hf,
        mf,
        0,
        0
      );

      try {
        await sessoesApi.create({
          tutorId,
          disciplina,
          data_hora_inicio: data_hora_inicio.toISOString(),
          data_hora_fim: data_hora_fim.toISOString(),
          observacoes,
        });
        toast.success("Sessão agendada!");
        setShowAgendamento(false);
        setTutorSelecionado(null);
        setDisponibilidades([]);
        queryClient.invalidateQueries({ queryKey: ["sessoes"] });
        queryClient.invalidateQueries({ queryKey: ["tutores"] });
      } catch (error) {
        toast.error(error.response?.data?.error || "Erro ao agendar");
      }
    },
    [queryClient],
  );

  // Rating
  const abrirAvaliacao = useCallback((sessao) => {
    setSessaoParaAvaliar(sessao);
    setShowAvaliacao(true);
  }, []);

  const handleAvaliar = useCallback(
    async (nota, comentario) => {
      if (!sessaoParaAvaliar) return;
      const ok = await avaliar(sessaoParaAvaliar._id, nota, comentario);
      if (ok) setShowAvaliacao(false);
    },
    [sessaoParaAvaliar, avaliar],
  );

  // Cancellation
  const abrirCancelamento = useCallback((sessao) => {
    setSessaoParaCancelar(sessao);
    setShowCancelamento(true);
  }, []);

  const handleCancelar = useCallback(
    async (motivo) => {
      if (!sessaoParaCancelar) return;
      const ok = await cancelar(sessaoParaCancelar._id, motivo);
      if (ok) setShowCancelamento(false);
    },
    [sessaoParaCancelar, cancelar],
  );

  const loading = tutoresLoading || sessoesLoading;

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex gap-4 mb-8 border-b">
            <div className="pb-4 px-2 font-medium text-violet-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Buscar Tutores
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TutorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        {/* Hours Tracking Card */}
        <HoursTrackingCard />

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("tutores")}
            className={`pb-4 px-2 font-medium relative transition-all duration-300 ${activeTab === "tutores" ? "text-violet-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Buscar Tutores
            </div>
            {activeTab === "tutores" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 animate-in slide-in-from-left duration-300" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("sessoes")}
            className={`pb-4 px-2 font-medium relative transition-all duration-300 ${activeTab === "sessoes" ? "text-violet-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Minhas Sessões
              {sessoes.length > 0 && (
                <Badge className="bg-violet-100 text-violet-700 transition-all duration-300">
                  {sessoes.length}
                </Badge>
              )}
            </div>
            {activeTab === "sessoes" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 animate-in slide-in-from-left duration-300" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "tutores" && (
          <TutorSearchTab
            tutores={filteredTutores}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDisciplina={selectedDisciplina}
            onDisciplinaChange={setSelectedDisciplina}
            allDisciplinas={allDisciplinas}
            onViewProfile={abrirDetalhesTutor}
            onSchedule={abrirModalAgendamento}
          />
        )}

        {activeTab === "sessoes" && (
          <SessionsTab
            sessoes={sessoes}
            userId={user?._id}
            onConfirm={confirmar}
            onComplete={concluir}
            onCancel={abrirCancelamento}
            onRate={abrirAvaliacao}
            onGoToTutores={() => setActiveTab("tutores")}
          />
        )}
      </div>

      {/* Modals */}
      <TutorDetailsModal
        tutor={tutorDetalhes}
        avaliacoes={avaliacoesTutor}
        loadingAvaliacoes={loadingAvaliacoes}
        open={showDetalhesTutor}
        onClose={setShowDetalhesTutor}
        onSchedule={abrirModalAgendamento}
      />

      <ScheduleModal
        tutor={tutorSelecionado}
        disponibilidades={disponibilidades}
        loadingDisponibilidade={loadingDisponibilidade}
        open={showAgendamento}
        onClose={setShowAgendamento}
        onSubmit={handleAgendar}
      />

      <RateModal open={showAvaliacao} onClose={setShowAvaliacao} onSubmit={handleAvaliar} />

      <CancelModal
        open={showCancelamento}
        onClose={setShowCancelamento}
        onSubmit={handleCancelar}
      />
    </div>
  );
}

export default Dashboard;
