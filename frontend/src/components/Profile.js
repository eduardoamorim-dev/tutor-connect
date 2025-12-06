import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Plus, 
  X, 
  BookOpen, 
  GraduationCap, 
  Clock,
  MapPin,
  Save,
  Loader2,
  Star,
  Calendar as CalendarIcon
} from 'lucide-react';

const API_URL = 'http://localhost:5001';

const DISCIPLINAS_SUGERIDAS = [
  'Cálculo I', 'Cálculo II', 'Cálculo III',
  'Álgebra Linear', 'Geometria Analítica',
  'Física I', 'Física II', 'Física III',
  'Química Geral', 'Química Orgânica',
  'Programação I', 'Estrutura de Dados',
  'Banco de Dados', 'Algoritmos',
  'Estatística', 'Probabilidade',
  'Biologia', 'Genética', 'Anatomia',
  'História', 'Geografia', 'Filosofia',
  'Inglês', 'Espanhol', 'Português'
].sort();

const NIVEIS = ['Básico', 'Intermediário', 'Avançado'];

function Profile({ token, user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingDisponibilidade, setSavingDisponibilidade] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: '',
    localizacao: '',
    isTutor: false,
    disciplinas_dominadas: [],
    disciplinas_precisa: [],
    disponibilidade: []
  });

  const [novaDisciplinaDomina, setNovaDisciplinaDomina] = useState('');
  const [nivelDomina, setNivelDomina] = useState('Intermediário');
  
  const [novaDisciplinaPrecisa, setNovaDisciplinaPrecisa] = useState('');
  const [nivelPrecisa, setNivelPrecisa] = useState('Básico');

  const [novaDisponibilidade, setNovaDisponibilidade] = useState({
    data: '',
    horario_inicio: '08:00',
    horario_fim: '12:00'
  });

  const [stats, setStats] = useState({ totalSessoes: 0, rating: 0, totalAvaliacoes: 0 });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, { headers });
      const data = response.data;
      setFormData({
        bio: data.bio || '',
        localizacao: data.localizacao || '',
        isTutor: data.isTutor || false,
        disciplinas_dominadas: data.disciplinas_dominadas || [],
        disciplinas_precisa: data.disciplinas_precisa || [],
        disponibilidade: data.disponibilidade || []
      });
      setStats({
        totalSessoes: data.total_sessoes || 0,
        rating: data.rating || 0,
        totalAvaliacoes: data.total_avaliacoes || 0
      });
    } catch (error) {
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    // Adiciona T12:00:00 para evitar problemas de timezone
    const date = new Date(dateStr);
    // Ajusta para timezone local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const adicionarDisciplinaDomina = () => {
    if (novaDisciplinaDomina.trim()) {
      const existe = formData.disciplinas_dominadas.some(
        d => d.disciplina.toLowerCase() === novaDisciplinaDomina.toLowerCase()
      );
      if (existe) {
        toast.error('Disciplina já adicionada');
        return;
      }
      setFormData({
        ...formData,
        disciplinas_dominadas: [
          ...formData.disciplinas_dominadas,
          { disciplina: novaDisciplinaDomina, nivel: nivelDomina }
        ]
      });
      setNovaDisciplinaDomina('');
    }
  };

  const removerDisciplinaDomina = (index) => {
    setFormData({
      ...formData,
      disciplinas_dominadas: formData.disciplinas_dominadas.filter((_, i) => i !== index)
    });
  };

  const adicionarDisciplinaPrecisa = () => {
    if (novaDisciplinaPrecisa.trim()) {
      const existe = formData.disciplinas_precisa.some(
        d => d.disciplina.toLowerCase() === novaDisciplinaPrecisa.toLowerCase()
      );
      if (existe) {
        toast.error('Disciplina já adicionada');
        return;
      }
      setFormData({
        ...formData,
        disciplinas_precisa: [
          ...formData.disciplinas_precisa,
          { disciplina: novaDisciplinaPrecisa, nivel_desejado: nivelPrecisa }
        ]
      });
      setNovaDisciplinaPrecisa('');
    }
  };

  const removerDisciplinaPrecisa = (index) => {
    setFormData({
      ...formData,
      disciplinas_precisa: formData.disciplinas_precisa.filter((_, i) => i !== index)
    });
  };

  const adicionarDisponibilidade = async () => {
    if (!novaDisponibilidade.data || !novaDisponibilidade.horario_inicio || !novaDisponibilidade.horario_fim) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (novaDisponibilidade.horario_inicio >= novaDisponibilidade.horario_fim) {
      toast.error('Horário de início deve ser antes do fim');
      return;
    }

    try {
      setSavingDisponibilidade(true);
      const response = await axios.post(`${API_URL}/users/disponibilidade`, novaDisponibilidade, { headers });
      setFormData({ ...formData, disponibilidade: response.data.disponibilidade });
      setNovaDisponibilidade({ data: '', horario_inicio: '08:00', horario_fim: '12:00' });
      toast.success('Disponibilidade adicionada!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao adicionar');
    } finally {
      setSavingDisponibilidade(false);
    }
  };

  const removerDisponibilidade = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/users/disponibilidade/${id}`, { headers });
      setFormData({ ...formData, disponibilidade: response.data.disponibilidade });
      toast.success('Disponibilidade removida');
    } catch (error) {
      toast.error('Erro ao remover');
    }
  };

  const handleSave = async () => {
    if (formData.isTutor && formData.disciplinas_dominadas.length === 0) {
      toast.error('Adicione pelo menos uma disciplina que você domina');
      return;
    }
    
    try {
      setLoading(true);
      await axios.put(`${API_URL}/users/profile`, {
        bio: formData.bio,
        localizacao: formData.localizacao,
        isTutor: formData.isTutor,
        disciplinas_dominadas: formData.disciplinas_dominadas,
        disciplinas_precisa: formData.disciplinas_precisa
      }, { headers });
      toast.success('Perfil atualizado!');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const disponibilidadesPorData = formData.disponibilidade.reduce((acc, disp) => {
    // Usar data local em vez de UTC
    const date = new Date(disp.data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dataKey = `${year}-${month}-${day}`;
    if (!acc[dataKey]) acc[dataKey] = [];
    acc[dataKey].push(disp);
    return acc;
  }, {});

  const datasOrdenadas = Object.keys(disponibilidadesPorData).sort();
  const hoje = new Date().toISOString().split('T')[0];

  if (loadingProfile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações e preferências</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-violet-100 text-xl text-violet-700">
                {getInitials(user?.nome)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user?.nome}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className={formData.isTutor ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}>
                  {formData.isTutor ? 'Tutor' : 'Aluno'}
                </Badge>
                {formData.isTutor && stats.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{stats.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({stats.totalAvaliacoes})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">Informações Básicas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" />Localização</Label>
            <Input placeholder="Ex: São Paulo, SP" value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} />
          </div>
          <div>
            <Label className="mb-2 block">Bio</Label>
            <Textarea placeholder="Conte um pouco sobre você..." value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} maxLength={500} />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input type="checkbox" id="isTutor" checked={formData.isTutor}
              onChange={(e) => setFormData({ ...formData, isTutor: e.target.checked })}
              className="w-5 h-5 text-violet-600 rounded" />
            <div>
              <Label htmlFor="isTutor" className="font-medium cursor-pointer">Quero ser tutor</Label>
              <p className="text-sm text-gray-500">Ative para poder dar aulas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />Disciplinas que Preciso Aprender
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={novaDisciplinaPrecisa} onValueChange={setNovaDisciplinaPrecisa}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {DISCIPLINAS_SUGERIDAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={nivelPrecisa} onValueChange={setNivelPrecisa}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>{NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={adicionarDisciplinaPrecisa} size="icon" className="bg-violet-600"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {formData.disciplinas_precisa.map((d, i) => (
              <Badge key={i} className="bg-indigo-100 text-indigo-700 pr-1 py-1">
                {d.disciplina} • {d.nivel_desejado}
                <button onClick={() => removerDisciplinaPrecisa(i)} className="ml-2"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {formData.isTutor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />Disciplinas que Posso Ensinar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={novaDisciplinaDomina} onValueChange={setNovaDisciplinaDomina}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS_SUGERIDAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={nivelDomina} onValueChange={setNivelDomina}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={adicionarDisciplinaDomina} size="icon" className="bg-violet-600"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {formData.disciplinas_dominadas.map((d, i) => (
                <Badge key={i} className="bg-violet-100 text-violet-700 pr-1 py-1">
                  {d.disciplina} • {d.nivel}
                  <button onClick={() => removerDisciplinaDomina(i)} className="ml-2"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {formData.isTutor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />Minha Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Adicione as datas e horários em que você está disponível para dar tutorias.
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Data</Label>
                <Input type="date" value={novaDisponibilidade.data} min={hoje}
                  onChange={(e) => setNovaDisponibilidade({ ...novaDisponibilidade, data: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Início</Label>
                <Input type="time" value={novaDisponibilidade.horario_inicio}
                  onChange={(e) => setNovaDisponibilidade({ ...novaDisponibilidade, horario_inicio: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Fim</Label>
                <Input type="time" value={novaDisponibilidade.horario_fim}
                  onChange={(e) => setNovaDisponibilidade({ ...novaDisponibilidade, horario_fim: e.target.value })} />
              </div>
              <div className="flex items-end">
                <Button onClick={adicionarDisponibilidade} disabled={savingDisponibilidade} className="w-full bg-green-600 hover:bg-green-700">
                  {savingDisponibilidade ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Adicionar</>}
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {datasOrdenadas.length > 0 ? (
                datasOrdenadas.map(dataKey => (
                  <div key={dataKey} className="border rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">{formatDate(dataKey)}</div>
                    <div className="flex flex-wrap gap-2">
                      {disponibilidadesPorData[dataKey].map((disp) => (
                        <div key={disp._id} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm">
                          <Clock className="w-3 h-3" />
                          {disp.horario_inicio} - {disp.horario_fim}
                          <button onClick={() => removerDisponibilidade(disp._id)} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma disponibilidade cadastrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Salvar Alterações</>}
        </Button>
      </div>
    </div>
  );
}

export default Profile;
