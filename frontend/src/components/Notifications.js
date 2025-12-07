import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Star,
  XCircle,
  CheckCircle,
  Clock,
  Loader2,
  ExternalLink,
} from "lucide-react";

const API_URL = "http://localhost:5001";

// Ícones por tipo de notificação
const getNotificationIcon = (tipo) => {
  const icons = {
    sessao_agendada: <Calendar className="w-4 h-4 text-blue-500" />,
    sessao_confirmada: <CheckCircle className="w-4 h-4 text-green-500" />,
    sessao_cancelada: <XCircle className="w-4 h-4 text-red-500" />,
    sessao_concluida: <Check className="w-4 h-4 text-violet-500" />,
    avaliacao_pendente: <Star className="w-4 h-4 text-yellow-500" />,
    avaliacao_recebida: (
      <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
    ),
    lembrete_sessao: <Clock className="w-4 h-4 text-orange-500" />,
  };
  return icons[tipo] || <Bell className="w-4 h-4 text-gray-500" />;
};

// Cores de fundo por tipo
const getNotificationBg = (tipo, lida) => {
  if (lida) return "bg-gray-50 hover:bg-gray-100";

  const colors = {
    sessao_agendada: "bg-blue-50 hover:bg-blue-100",
    sessao_confirmada: "bg-green-50 hover:bg-green-100",
    sessao_cancelada: "bg-red-50 hover:bg-red-100",
    sessao_concluida: "bg-violet-50 hover:bg-violet-100",
    avaliacao_pendente: "bg-yellow-50 hover:bg-yellow-100",
    avaliacao_recebida: "bg-yellow-50 hover:bg-yellow-100",
    lembrete_sessao: "bg-orange-50 hover:bg-orange-100",
  };
  return colors[tipo] || "bg-gray-50 hover:bg-gray-100";
};

// Texto da ação por tipo
const getActionText = (tipo) => {
  const actions = {
    sessao_agendada: "Ver sessão",
    sessao_confirmada: "Ver sessão",
    sessao_cancelada: "Ver detalhes",
    sessao_concluida: "Ver sessão",
    avaliacao_pendente: "Avaliar agora",
    avaliacao_recebida: "Ver avaliação",
    lembrete_sessao: "Ver sessão",
  };
  return actions[tipo] || "Ver mais";
};

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Notifications({ token }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${token}` };

  // Buscar contagem de não lidas
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/notificacoes/count`, { headers });
      setCount(res.data.count);
    } catch (error) {
      console.error("Erro ao buscar contagem:", error);
    }
  };

  // Buscar notificações
  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/notificacoes?limit=20`, {
        headers,
      });
      setNotificacoes(res.data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como lida
  const marcarComoLida = async (id) => {
    try {
      await axios.put(`${API_URL}/notificacoes/${id}/ler`, {}, { headers });
      setNotificacoes((prev) =>
        prev.map((n) => (n._id === id ? { ...n, lida: true } : n)),
      );
      setCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      await axios.put(`${API_URL}/notificacoes/ler-todas`, {}, { headers });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      setCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  // Deletar notificação
  const deletarNotificacao = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/notificacoes/${id}`, { headers });
      const notificacao = notificacoes.find((n) => n._id === id);
      setNotificacoes((prev) => prev.filter((n) => n._id !== id));
      if (!notificacao?.lida) {
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
    }
  };

  // Limpar todas lidas
  const limparLidas = async () => {
    try {
      await axios.delete(`${API_URL}/notificacoes`, { headers });
      setNotificacoes((prev) => prev.filter((n) => !n.lida));
    } catch (error) {
      console.error("Erro ao limpar lidas:", error);
    }
  };

  // Navegar para a ação da notificação
  const handleNotificationClick = async (notificacao) => {
    // Marcar como lida se ainda não foi
    if (!notificacao.lida) {
      await marcarComoLida(notificacao._id);
    }

    // Fechar dropdown
    setIsOpen(false);

    // Navegar baseado no tipo
    switch (notificacao.tipo) {
      case "sessao_agendada":
      case "sessao_confirmada":
      case "sessao_cancelada":
      case "sessao_concluida":
      case "avaliacao_pendente":
      case "lembrete_sessao":
        // Navegar para dashboard na aba de sessões
        navigate("/dashboard?tab=sessoes");
        break;

      case "avaliacao_recebida":
        // Navegar para o perfil
        navigate("/profile");
        break;

      default:
        navigate("/dashboard");
    }
  };

  // Polling para atualizar contagem
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // A cada 30 segundos
    return () => clearInterval(interval);
  }, [token]);

  // Buscar notificações quando abrir
  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes();
    }
  }, [isOpen]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1 animate-pulse">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={marcarTodasComoLidas}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </button>
              )}
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
              </div>
            ) : notificacoes.length > 0 ? (
              <div className="divide-y">
                {notificacoes.map((notificacao) => (
                  <div
                    key={notificacao._id}
                    onClick={() => handleNotificationClick(notificacao)}
                    className={`px-4 py-3 cursor-pointer transition-colors ${getNotificationBg(notificacao.tipo, notificacao.lida)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(notificacao.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${notificacao.lida ? "text-gray-600" : "text-gray-900 font-medium"}`}
                          >
                            {notificacao.titulo}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notificacao.data_criacao)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {notificacao.mensagem}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-violet-600 font-medium flex items-center gap-1">
                            {getActionText(notificacao.tipo)}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                          <button
                            onClick={(e) =>
                              deletarNotificacao(notificacao._id, e)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                      {!notificacao.lida && (
                        <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm font-medium">Nenhuma notificação</p>
                <p className="text-xs mt-1">Você está em dia!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notificacoes.some((n) => n.lida) && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <button
                onClick={limparLidas}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Limpar lidas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
