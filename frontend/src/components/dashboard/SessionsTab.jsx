import React, { useState, useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Search } from "lucide-react";
import SessionCard from "./SessionCard";

function SessionsTab({ sessoes, userId, onConfirm, onComplete, onCancel, onRate, onGoToTutores }) {
  const [filtroStatus, setFiltroStatus] = useState("ativas");
  const [isChangingFilter, setIsChangingFilter] = useState(false);

  const handleFilterChange = (newFilter) => {
    if (newFilter === filtroStatus) return;
    setIsChangingFilter(true);
    setTimeout(() => {
      setFiltroStatus(newFilter);
      setTimeout(() => setIsChangingFilter(false), 50);
    }, 150);
  };

  const sessoesFiltradas = useMemo(() => {
    return sessoes.filter((sessao) => {
      if (filtroStatus === "ativas") {
        return sessao.status === "Pendente" || sessao.status === "Confirmada";
      } else if (filtroStatus === "finalizadas") {
        return sessao.status === "Concluída" || sessao.status === "Cancelada";
      }
      return true;
    });
  }, [sessoes, filtroStatus]);

  const countAtivas = sessoes.filter(
    (s) => s.status === "Pendente" || s.status === "Confirmada",
  ).length;
  const countFinalizadas = sessoes.filter(
    (s) => s.status === "Concluída" || s.status === "Cancelada",
  ).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => handleFilterChange("ativas")}
            className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filtroStatus === "ativas"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <span className="relative z-10">Ativas</span>
            {countAtivas > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  filtroStatus === "ativas"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {countAtivas}
              </span>
            )}
          </button>

          <button
            onClick={() => handleFilterChange("finalizadas")}
            className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filtroStatus === "finalizadas"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <span className="relative z-10">Finalizadas</span>
            {countFinalizadas > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  filtroStatus === "finalizadas"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {countFinalizadas}
              </span>
            )}
          </button>

          <button
            onClick={() => handleFilterChange("todas")}
            className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              filtroStatus === "todas"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <span className="relative z-10">Todas</span>
            {sessoes.length > 0 && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  filtroStatus === "todas"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {sessoes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        className="relative transition-all duration-300"
        style={{
          minHeight: "500px",
          opacity: isChangingFilter ? 0.6 : 1,
        }}
      >
        {sessoesFiltradas.length > 0 ? (
          <div className="grid gap-4">
            {sessoesFiltradas.map((sessao, index) => (
              <SessionCard
                key={sessao._id}
                sessao={sessao}
                userId={userId}
                index={index}
                onConfirm={onConfirm}
                onComplete={onComplete}
                onCancel={onCancel}
                onRate={onRate}
              />
            ))}
          </div>
        ) : (
          <Card className="animate-in fade-in zoom-in duration-500">
            <CardContent className="flex flex-col items-center py-16 text-gray-500">
              <Calendar className="w-16 h-16 mb-4 text-gray-300 animate-in zoom-in duration-500" />
              <p className="text-lg font-medium mb-2">
                {filtroStatus === "ativas"
                  ? "Nenhuma sessao ativa"
                  : filtroStatus === "finalizadas"
                    ? "Nenhuma sessao finalizada"
                    : "Nenhuma sessao"}
              </p>
              {filtroStatus !== "todas" && sessoes.length > 0 && (
                <Button
                  onClick={() => handleFilterChange("todas")}
                  variant="outline"
                  className="mt-4"
                >
                  Ver todas as sessoes
                </Button>
              )}
              {sessoes.length === 0 && (
                <Button onClick={onGoToTutores} className="mt-4 bg-violet-600">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Tutores
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default SessionsTab;
