import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar, Clock, BookOpen, Users, Video, Search, Plus, Loader2, X } from 'lucide-react';

const API_URL = 'http://localhost:5001';

function Dashboard({ token }) {
  const [activeTab, setActiveTab] = useState('tutores');
  const [tutores, setTutores] = useState([]);
  const [sessoes, setSessoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDisciplina, setSelectedDisciplina] = useState('all');
  
  // Modal de agendamento
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [tutorSelecionado, setTutorSelecionado] = useState(null);
  const [agendamentoLoading, setAgendamentoLoading] = useState(false);
  const [agendamentoForm, setAgendamentoForm] = useState({
    disciplina: '',
    data: '',
    hora_inicio: '',
    hora_fim: ''
  });
  const [showDebug, setShowDebug] = useState(false);
  const [myProfile, setMyProfile] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutoresRes, sessoesRes] = await Promise.all([
        axios.get(`${API_URL}/users/tutores`, { headers }),
        axios.get(`${API_URL}/sessoes/minhas-sessoes`, { headers })
      ]);
      setTutores(tutoresRes.data);
      setSessoes(sessoesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const abrirModalAgendamento = (tutor) => {
    setTutorSelecionado(tutor);
    setAgendamentoForm({
      disciplina: tutor.disciplinas_dominadas[0]?.disciplina || '',
      data: '',
      hora_inicio: '',
      hora_fim: ''
    });
    setShowAgendamento(true);
  };

  const fecharModalAgendamento = () => {
    setShowAgendamento(false);
    setTutorSelecionado(null);
    setAgendamentoForm({
      disciplina: '',
      data: '',
      hora_inicio: '',
      hora_fim: ''
    });
  };

  const handleAgendar = async () => {
    try {
      setAgendamentoLoading(true);

      // Validações
      if (!agendamentoForm.disciplina || !agendamentoForm.data || 
          !agendamentoForm.hora_inicio || !agendamentoForm.hora_fim) {
        alert('Preencha todos os campos!');
        return;
      }

      // Combinar data e hora para criar o datetime
      const data_hora_inicio = new Date(`${agendamentoForm.data}T${agendamentoForm.hora_inicio}:00`);
      const data_hora_fim = new Date(`${agendamentoForm.data}T${agendamentoForm.hora_fim}:00`);

      // Validar se hora fim é depois da hora início
      if (data_hora_fim <= data_hora_inicio) {
        alert('A hora de término deve ser depois da hora de início!');
        return;
      }

      const payload = {
        tutorId: tutorSelecionado._id,
        disciplina: agendamentoForm.disciplina,
        data_hora_inicio: data_hora_inicio.toISOString(),
        data_hora_fim: data_hora_fim.toISOString()
      };

      await axios.post(`${API_URL}/sessoes/create`, payload, { headers });

      alert('Sessão agendada com sucesso! ✅');
      fecharModalAgendamento();
      fetchData(); // Recarrega as sessões

    } catch (error) {
      console.error('Erro ao agendar:', error);
      alert('Erro ao agendar sessão: ' + (error.response?.data?.error || error.message));
    } finally {
      setAgendamentoLoading(false);
    }
  };

  // Extrair todas as disciplinas únicas
  const allDisciplinas = [...new Set(
    tutores.flatMap(t => t.disciplinas_dominadas.map(d => d.disciplina))
  )].sort();

  // Filtrar tutores
  const filteredTutores = tutores.filter(tutor => {
    const matchesSearch = tutor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.disciplinas_dominadas.some(d => 
        d.disciplina.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDisciplina = selectedDisciplina === 'all'
      ? true
      : tutor.disciplinas_dominadas.some(d => d.disciplina === selectedDisciplina);
    return matchesSearch && matchesDisciplina;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-violet-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('tutores')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'tutores'
                ? 'text-violet-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Buscar Tutores
            </div>
            {activeTab === 'tutores' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sessoes')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'sessoes'
                ? 'text-violet-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Minhas Sessões
              {sessoes.length > 0 && (
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {sessoes.length}
                </Badge>
              )}
            </div>
            {activeTab === 'sessoes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
        </div>

        {/* Conteúdo - Tutores */}
        {activeTab === 'tutores' && (
          <div>
            {/* Filtros */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou disciplina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Todas as disciplinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {allDisciplinas.map((disciplina, index) => (
                    <SelectItem key={index} value={disciplina}>
                      {disciplina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de Tutores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTutores.length > 0 ? (
                filteredTutores.map((tutor) => (
                  <Card key={tutor._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="bg-violet-100 text-lg text-violet-700">
                            {getInitials(tutor.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center w-full">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {tutor.nome}
                          </h3>
                          {tutor.localizacao && (
                            <p className="text-sm text-gray-500 mt-1">
                              {tutor.localizacao}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="text-sm text-gray-500 mb-2 font-medium">
                            Disciplinas:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tutor.disciplinas_dominadas.map((disc, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-violet-100 text-violet-700 hover:bg-violet-200"
                              >
                                {disc.disciplina}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          className="w-full bg-violet-700 hover:bg-violet-600"
                          onClick={() => abrirModalAgendamento(tutor)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Agendar Sessão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                  <Users className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhum tutor encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo - Sessões */}
        {activeTab === 'sessoes' && (
          <div>
            {sessoes.length > 0 ? (
              <div className="grid gap-4">
                {sessoes.map((sessao) => (
                  <Card key={sessao._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-violet-100 text-violet-700">
                              {getInitials(sessao.tutor.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {sessao.disciplina}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  com {sessao.tutor.nome}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  sessao.status === 'Confirmada'
                                    ? 'default'
                                    : sessao.status === 'Concluída'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className={
                                  sessao.status === 'Confirmada'
                                    ? 'bg-green-100 text-green-700'
                                    : ''
                                }
                              >
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
                                {new Date(sessao.data_hora_fim).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {sessao.link_meet && (
                                <Button
                                  size="sm"
                                  className="bg-violet-700 hover:bg-violet-600"
                                  onClick={() => window.open(sessao.link_meet, '_blank')}
                                >
                                  <Video className="w-4 h-4 mr-2" />
                                  Entrar no Meet
                                </Button>
                              )}
                              {sessao.avaliacao_pendente && sessao.status === 'Concluída' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    // Implementar modal de avaliação
                                    alert(`Avaliar sessão ${sessao._id}`);
                                  }}
                                >
                                  Avaliar Sessão
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Calendar className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    Você ainda não tem sessões agendadas
                  </p>
                  <p className="text-sm mb-4">
                    Encontre um tutor e agende sua primeira sessão!
                  </p>
                  <Button
                    onClick={() => setActiveTab('tutores')}
                    className="bg-violet-700 hover:bg-violet-600"
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

      {/* Modal de Agendamento */}
      <Dialog open={showAgendamento} onOpenChange={setShowAgendamento}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Agendar Sessão</DialogTitle>
            <DialogDescription>
              {tutorSelecionado && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-violet-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-violet-100 text-violet-700">
                      {getInitials(tutorSelecionado.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{tutorSelecionado.nome}</p>
                    <p className="text-sm text-gray-600">{tutorSelecionado.email}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Selecionar Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select
                value={agendamentoForm.disciplina}
                onValueChange={(value) => setAgendamentoForm({ ...agendamentoForm, disciplina: value })}
              >
                <SelectTrigger id="disciplina">
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {tutorSelecionado?.disciplinas_dominadas.map((disc, index) => (
                    <SelectItem key={index} value={disc.disciplina}>
                      {disc.disciplina} - {disc.nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={agendamentoForm.data}
                onChange={(e) => setAgendamentoForm({ ...agendamentoForm, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Início</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={agendamentoForm.hora_inicio}
                  onChange={(e) => setAgendamentoForm({ ...agendamentoForm, hora_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora_fim">Hora Fim</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={agendamentoForm.hora_fim}
                  onChange={(e) => setAgendamentoForm({ ...agendamentoForm, hora_fim: e.target.value })}
                />
              </div>
            </div>

            {/* Disponibilidade do Tutor (se existir) */}
            {tutorSelecionado?.disponibilidade && tutorSelecionado.disponibilidade.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  💡 Disponibilidade do tutor:
                </p>
                <div className="flex flex-wrap gap-2">
                  {tutorSelecionado.disponibilidade.map((disp, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {disp.dia}: {disp.horario_inicio} - {disp.horario_fim}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={fecharModalAgendamento}
              disabled={agendamentoLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgendar}
              disabled={agendamentoLoading}
              className="bg-violet-700 hover:bg-violet-600"
            >
              {agendamentoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Confirmar Agendamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;