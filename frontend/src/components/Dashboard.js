import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Search,
  Loader2,
  Star,
  CheckCircle,
  XCircle,
  MapPin,
  MessageSquare,
  Eye,
} from "lucide-react";

const API_URL = "http://localhost:5001";

function Dashboard({ token, user }) {
  const [activeTab, setActiveTab] = useState("tutores");
  const [tutores, setTutores] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDisciplina, setSelectedDisciplina] = useState("all");

  const [showAgendamento, setShowAgendamento] = useState(false);
  const [tutorSelecionado, setTutorSelecionado] = useState(null);
  const [agendamentoLoading, setAgendamentoLoading] = useState(false);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisponibilidade, setLoadingDisponibilidade] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [agendamentoForm, setAgendamentoForm] = useState({
    disciplina: "",
    observacoes: "",
  });

  const [showAvaliacao, setShowAvaliacao] = useState(false);
  const [sessaoParaAvaliar, setSessaoParaAvaliar] = useState(null);
  const [avaliacaoForm, setAvaliacaoForm] = useState({
    nota: 5,
    comentario: "",
  });
  const [avaliacaoLoading, setAvaliacaoLoading] = useState(false);

  const [showCancelamento, setShowCancelamento] = useState(false);
  const [sessaoParaCancelar, setSessaoParaCancelar] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [cancelamentoLoading, setCancelamentoLoading] = useState(false);

  // Novo estado para modal de detalhes do tutor
  const [showDetalhesTutor, setShowDetalhesTutor] = useState(false);
  const [tutorDetalhes, setTutorDetalhes] = useState(null);
  const [avaliacoesTutor, setAvaliacoesTutor] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutoresRes, sessoesRes] = await Promise.all([
        axios.get(`${API_URL}/users/tutores`, { headers }),
        axios.get(`${API_URL}/sessoes/minhas-sessoes`, { headers }),
      ]);
      setTutores(tutoresRes.data);
      setSessoes(sessoesRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatDateFull = (date) => {
    const dateStr =
      typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)
        ? date + "T12:00:00"
        : date;
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Função para abrir modal de detalhes do tutor
  const abrirDetalhesTutor = async (tutor) => {
    setTutorDetalhes(tutor);
    setShowDetalhesTutor(true);
    setLoadingAvaliacoes(true);

    try {
      const res = await axios.get(
        `${API_URL}/sessoes/avaliacoes/tutor/${tutor._id}`,
        { headers },
      );
      setAvaliacoesTutor(res.data);
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
      setAvaliacoesTutor([]);
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  const fecharDetalhesTutor = () => {
    setShowDetalhesTutor(false);
    setTutorDetalhes(null);
    setAvaliacoesTutor([]);
  };

  const abrirModalAgendamento = async (tutor) => {
    setTutorSelecionado(tutor);
    setAgendamentoForm({
      disciplina: tutor.disciplinas_dominadas[0]?.disciplina || "",
      observacoes: "",
    });
    setSlotSelecionado(null);
    setShowAgendamento(true);
    setShowDetalhesTutor(false);
    try {
      setLoadingDisponibilidade(true);
      const res = await axios.get(
        `${API_URL}/users/tutor/${tutor._id}/disponibilidade`,
        { headers },
      );
      setDisponibilidades(res.data);
    } catch (error) {
      setDisponibilidades([]);
    } finally {
      setLoadingDisponibilidade(false);
    }
  };

  const fecharModalAgendamento = () => {
    setShowAgendamento(false);
    setTutorSelecionado(null);
    setDisponibilidades([]);
    setSlotSelecionado(null);
  };

  const handleAgendar = async () => {
    try {
      setAgendamentoLoading(true);
      if (!agendamentoForm.disciplina || !slotSelecionado) {
        toast.error("Selecione disciplina e horário");
        return;
      }
      const dataSlot = new Date(slotSelecionado.data);
      const [hi, mi] = slotSelecionado.horario_inicio.split(":").map(Number);
      const [hf, mf] = slotSelecionado.horario_fim.split(":").map(Number);
      const data_hora_inicio = new Date(dataSlot);
      data_hora_inicio.setHours(hi, mi, 0, 0);
      const data_hora_fim = new Date(dataSlot);
      data_hora_fim.setHours(hf, mf, 0, 0);

      await axios.post(
        `${API_URL}/sessoes/create`,
        {
          tutorId: tutorSelecionado._id,
          disciplina: agendamentoForm.disciplina,
          data_hora_inicio: data_hora_inicio.toISOString(),
          data_hora_fim: data_hora_fim.toISOString(),
          observacoes: agendamentoForm.observacoes,
        },
        { headers },
      );
      toast.success("Sessão agendada!");
      fecharModalAgendamento();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao agendar");
    } finally {
      setAgendamentoLoading(false);
    }
  };

  const confirmarSessao = async (id) => {
    await axios.put(`${API_URL}/sessoes/${id}/confirmar`, {}, { headers });
    toast.success("Confirmada!");
    fetchData();
  };
  const concluirSessao = async (id) => {
    await axios.put(`${API_URL}/sessoes/${id}/concluir`, {}, { headers });
    toast.success("Concluída!");
    fetchData();
  };
  const abrirCancelamento = (s) => {
    setSessaoParaCancelar(s);
    setMotivoCancelamento("");
    setShowCancelamento(true);
  };
  const handleCancelar = async () => {
    setCancelamentoLoading(true);
    await axios.put(
      `${API_URL}/sessoes/${sessaoParaCancelar._id}/cancelar`,
      { motivo: motivoCancelamento },
      { headers },
    );
    toast.success("Cancelada");
    setShowCancelamento(false);
    fetchData();
    setCancelamentoLoading(false);
  };
  const abrirAvaliacao = (s) => {
    setSessaoParaAvaliar(s);
    setAvaliacaoForm({ nota: 5, comentario: "" });
    setShowAvaliacao(true);
  };
  const handleAvaliar = async () => {
    setAvaliacaoLoading(true);
    await axios.post(
      `${API_URL}/sessoes/avaliar`,
      {
        sessaoId: sessaoParaAvaliar._id,
        nota: avaliacaoForm.nota,
        comentario: avaliacaoForm.comentario,
      },
      { headers },
    );
    toast.success("Avaliação enviada!");
    setShowAvaliacao(false);
    fetchData();
    setAvaliacaoLoading(false);
  };

  const allDisciplinas = [
    ...new Set(
      tutores.flatMap((t) => t.disciplinas_dominadas.map((d) => d.disciplina)),
    ),
  ].sort();
  const filteredTutores = tutores.filter((t) => {
    const matchSearch =
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.disciplinas_dominadas.some((d) =>
        d.disciplina.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchDisc =
      selectedDisciplina === "all" ||
      t.disciplinas_dominadas.some((d) => d.disciplina === selectedDisciplina);
    return matchSearch && matchDisc;
  });

  const getStatusColor = (s) =>
    ({
      Pendente: "bg-yellow-100 text-yellow-700",
      Confirmada: "bg-green-100 text-green-700",
      Concluída: "bg-blue-100 text-blue-700",
      Cancelada: "bg-red-100 text-red-700",
    })[s] || "bg-gray-100";

  const disponibilidadesPorData = disponibilidades.reduce((acc, d) => {
    const date = new Date(d.data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const k = `${year}-${month}-${day}`;
    if (!acc[k]) acc[k] = [];
    acc[k].push(d);
    return acc;
  }, {});
  const datasDisponiveis = Object.keys(disponibilidadesPorData).sort();

  if (loading)
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("tutores")}
            className={`pb-4 px-2 font-medium relative ${activeTab === "tutores" ? "text-violet-600" : "text-gray-500"}`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Buscar Tutores
            </div>
            {activeTab === "tutores" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("sessoes")}
            className={`pb-4 px-2 font-medium relative ${activeTab === "sessoes" ? "text-violet-600" : "text-gray-500"}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Minhas Sessões
              {sessoes.length > 0 && (
                <Badge className="bg-violet-100 text-violet-700">
                  {sessoes.length}
                </Badge>
              )}
            </div>
            {activeTab === "sessoes" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
        </div>

        {activeTab === "tutores" && (
          <div>
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedDisciplina}
                onValueChange={setSelectedDisciplina}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {allDisciplinas.map((d, i) => (
                    <SelectItem key={i} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutores.length > 0 ? (
                filteredTutores.map((tutor) => (
                  <Card
                    key={tutor._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="bg-violet-100 text-lg text-violet-700">
                            {getInitials(tutor.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center w-full">
                          <h3 className="text-xl font-semibold">
                            {tutor.nome}
                          </h3>
                          {tutor.localizacao && (
                            <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {tutor.localizacao}
                            </p>
                          )}
                          {tutor.rating > 0 && (
                            <button
                              onClick={() => abrirDetalhesTutor(tutor)}
                              className="flex items-center justify-center gap-1 mt-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
                            >
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {tutor.rating.toFixed(1)}
                              </span>
                              <span className="text-gray-400 text-sm">
                                ({tutor.total_avaliacoes}{" "}
                                {tutor.total_avaliacoes === 1
                                  ? "avaliação"
                                  : "avaliações"}
                                )
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="text-sm text-gray-500 mb-2">
                            Disciplinas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.disciplinas_dominadas
                              .slice(0, 3)
                              .map((d, i) => (
                                <Badge
                                  key={i}
                                  className="bg-violet-100 text-violet-700"
                                >
                                  {d.disciplina}
                                </Badge>
                              ))}
                            {tutor.disciplinas_dominadas.length > 3 && (
                              <Badge variant="outline">
                                +{tutor.disciplinas_dominadas.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="w-full flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => abrirDetalhesTutor(tutor)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Perfil
                          </Button>
                          {tutor.disponibilidade?.length > 0 ? (
                            <Button
                              className="flex-1 bg-violet-600 hover:bg-violet-700"
                              onClick={() => abrirModalAgendamento(tutor)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Agendar
                            </Button>
                          ) : (
                            <Button
                              className="flex-1"
                              disabled
                              variant="outline"
                            >
                              Sem horários
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-16 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum tutor encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sessoes" && (
          <div>
            {sessoes.length > 0 ? (
              <div className="grid gap-4">
                {sessoes.map((sessao) => {
                  const isTutor = sessao.tutor._id === user?._id;
                  const outra = isTutor ? sessao.aluno : sessao.tutor;
                  const isPast = new Date(sessao.data_hora_fim) < new Date();
                  return (
                    <Card key={sessao._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-violet-100 text-violet-700">
                              {getInitials(outra.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {sessao.disciplina}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {isTutor ? "Aluno: " : "Tutor: "}
                                  {outra.nome}
                                </p>
                              </div>
                              <Badge className={getStatusColor(sessao.status)}>
                                {sessao.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(sessao.data_hora_inicio)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(sessao.data_hora_inicio)} -{" "}
                                {formatTime(sessao.data_hora_fim)}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sessao.link_meet &&
                                sessao.status !== "Cancelada" &&
                                sessao.status !== "Concluída" && (
                                  <Button
                                    size="sm"
                                    className="bg-violet-600"
                                    onClick={() =>
                                      window.open(sessao.link_meet, "_blank")
                                    }
                                  >
                                    <Video className="w-4 h-4 mr-2" />
                                    Meet
                                  </Button>
                                )}
                              {isTutor && sessao.status === "Pendente" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => confirmarSessao(sessao._id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Confirmar
                                </Button>
                              )}
                              {sessao.status === "Confirmada" && isPast && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => concluirSessao(sessao._id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Concluir
                                </Button>
                              )}
                              {!isTutor &&
                                sessao.status === "Concluída" &&
                                sessao.avaliacao_pendente && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => abrirAvaliacao(sessao)}
                                  >
                                    <Star className="w-4 h-4 mr-2" />
                                    Avaliar
                                  </Button>
                                )}
                              {(sessao.status === "Pendente" ||
                                sessao.status === "Confirmada") &&
                                !isPast && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => abrirCancelamento(sessao)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </Button>
                                )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center py-16 text-gray-500">
                  <Calendar className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Nenhuma sessão</p>
                  <Button
                    onClick={() => setActiveTab("tutores")}
                    className="bg-violet-600"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Tutores
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Tutor com Avaliações */}
      <Dialog open={showDetalhesTutor} onOpenChange={setShowDetalhesTutor}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil do Tutor</DialogTitle>
          </DialogHeader>

          {tutorDetalhes && (
            <div className="space-y-6">
              {/* Informações do Tutor */}
              <div className="flex items-start gap-4 p-4 bg-violet-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-violet-200 text-violet-700 text-xl">
                    {getInitials(tutorDetalhes.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tutorDetalhes.nome}
                  </h3>
                  {tutorDetalhes.localizacao && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {tutorDetalhes.localizacao}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {tutorDetalhes.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">
                          {tutorDetalhes.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({tutorDetalhes.total_avaliacoes})
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {tutorDetalhes.total_sessoes || 0} sessões realizadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {tutorDetalhes.bio && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sobre</h4>
                  <p className="text-gray-600 text-sm">{tutorDetalhes.bio}</p>
                </div>
              )}

              {/* Disciplinas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Disciplinas que ensina
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tutorDetalhes.disciplinas_dominadas.map((d, i) => (
                    <Badge key={i} className="bg-violet-100 text-violet-700">
                      {d.disciplina} • {d.nivel}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Avaliações e Comentários */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Avaliações e Comentários
                </h4>

                {loadingAvaliacoes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                  </div>
                ) : avaliacoesTutor.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {avaliacoesTutor.map((avaliacao) => (
                      <div
                        key={avaliacao._id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                {getInitials(
                                  avaliacao.aluno?.nome || "Anônimo",
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {avaliacao.aluno?.nome || "Anônimo"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {avaliacao.sessao?.disciplina &&
                                  `${avaliacao.sessao.disciplina} • `}
                                {new Date(avaliacao.data).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= avaliacao.nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {avaliacao.comentario && (
                          <p className="text-gray-600 text-sm mt-2 pl-10">
                            "{avaliacao.comentario}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 border rounded-lg">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma avaliação ainda</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={fecharDetalhesTutor}>
              Fechar
            </Button>
            {tutorDetalhes?.disponibilidade?.length > 0 && (
              <Button
                className="bg-violet-600 hover:bg-violet-700"
                onClick={() => abrirModalAgendamento(tutorDetalhes)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Sessão
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento */}
      <Dialog open={showAgendamento} onOpenChange={setShowAgendamento}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar Sessão</DialogTitle>
            <DialogDescription>
              {tutorSelecionado && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-violet-50 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {getInitials(tutorSelecionado.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tutorSelecionado.nome}
                    </p>
                    {tutorSelecionado.rating > 0 && (
                      <p className="text-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {tutorSelecionado.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Disciplina</Label>
              <Select
                value={agendamentoForm.disciplina}
                onValueChange={(v) =>
                  setAgendamentoForm({ ...agendamentoForm, disciplina: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tutorSelecionado?.disciplinas_dominadas.map((d, i) => (
                    <SelectItem key={i} value={d.disciplina}>
                      {d.disciplina} - {d.nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Selecione um horário</Label>
              {loadingDisponibilidade ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
              ) : datasDisponiveis.length > 0 ? (
                <div className="space-y-3 max-h-[250px] overflow-y-auto mt-2">
                  {datasDisponiveis.map((dk) => (
                    <div key={dk} className="border rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2 capitalize">
                        {formatDateFull(dk)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {disponibilidadesPorData[dk].map((d) => (
                          <button
                            key={d._id}
                            disabled={d.jaAgendado}
                            onClick={() => setSlotSelecionado(d)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${d.jaAgendado ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through" : slotSelecionado?._id === d._id ? "bg-violet-600 text-white ring-2 ring-violet-300" : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"}`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {d.horario_inicio} - {d.horario_fim}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border rounded-lg mt-2">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Sem horários disponíveis</p>
                </div>
              )}
            </div>
            {slotSelecionado && (
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-sm text-violet-700">
                  <strong>Selecionado:</strong>{" "}
                  {formatDateFull(slotSelecionado.data)} das{" "}
                  {slotSelecionado.horario_inicio} às{" "}
                  {slotSelecionado.horario_fim}
                </p>
              </div>
            )}
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Observações..."
                value={agendamentoForm.observacoes}
                onChange={(e) =>
                  setAgendamentoForm({
                    ...agendamentoForm,
                    observacoes: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fecharModalAgendamento}>
              Cancelar
            </Button>
            <Button
              onClick={handleAgendar}
              disabled={agendamentoLoading || !slotSelecionado}
              className="bg-violet-600"
            >
              {agendamentoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Avaliação */}
      <Dialog open={showAvaliacao} onOpenChange={setShowAvaliacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Sessão</DialogTitle>
            <DialogDescription>Como foi sua experiência?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nota</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setAvaliacaoForm({ ...avaliacaoForm, nota: n })
                    }
                    className={`p-2 ${avaliacaoForm.nota >= n ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    <Star
                      className={`w-8 h-8 ${avaliacaoForm.nota >= n ? "fill-current" : ""}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comentário (opcional)</Label>
              <Textarea
                placeholder="Conte como foi sua experiência..."
                value={avaliacaoForm.comentario}
                onChange={(e) =>
                  setAvaliacaoForm({
                    ...avaliacaoForm,
                    comentario: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvaliacao(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAvaliar}
              disabled={avaliacaoLoading}
              className="bg-violet-600"
            >
              {avaliacaoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelamento} onOpenChange={setShowCancelamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Sessão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Motivo (opcional)</Label>
            <Textarea
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              rows={2}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelamento(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={cancelamentoLoading}
            >
              {cancelamentoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
