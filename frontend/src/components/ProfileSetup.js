import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
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
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';

const API_URL = 'http://localhost:5001';

// Lista de disciplinas comuns
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
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

function ProfileSetup({ token, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    bio: '',
    localizacao: '',
    disciplinas_dominadas: [],
    disciplinas_precisa: [],
    disponibilidade: []
  });

  const [novaDisciplinaDomina, setNovaDisciplinaDomina] = useState('');
  const [nivelDomina, setNivelDomina] = useState('Intermediário');
  
  const [novaDisciplinaPrecisa, setNovaDisciplinaPrecisa] = useState('');
  const [nivelPrecisa, setNivelPrecisa] = useState('Básico');

  const [novaDisponibilidade, setNovaDisponibilidade] = useState({
    dia: 'Seg',
    horario_inicio: '',
    horario_fim: ''
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, { headers });
      setFormData({
        bio: response.data.bio || '',
        localizacao: response.data.localizacao || '',
        disciplinas_dominadas: response.data.disciplinas_dominadas || [],
        disciplinas_precisa: response.data.disciplinas_precisa || [],
        disponibilidade: response.data.disponibilidade || []
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const adicionarDisciplinaDomina = () => {
    if (novaDisciplinaDomina.trim()) {
      setFormData({
        ...formData,
        disciplinas_dominadas: [
          ...formData.disciplinas_dominadas,
          { disciplina: novaDisciplinaDomina, nivel: nivelDomina }
        ]
      });
      setNovaDisciplinaDomina('');
      setNivelDomina('Intermediário');
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
      setFormData({
        ...formData,
        disciplinas_precisa: [
          ...formData.disciplinas_precisa,
          { disciplina: novaDisciplinaPrecisa, nivel_desejado: nivelPrecisa }
        ]
      });
      setNovaDisciplinaPrecisa('');
      setNivelPrecisa('Básico');
    }
  };

  const removerDisciplinaPrecisa = (index) => {
    setFormData({
      ...formData,
      disciplinas_precisa: formData.disciplinas_precisa.filter((_, i) => i !== index)
    });
  };

  const adicionarDisponibilidade = () => {
    if (novaDisponibilidade.horario_inicio && novaDisponibilidade.horario_fim) {
      setFormData({
        ...formData,
        disponibilidade: [...formData.disponibilidade, novaDisponibilidade]
      });
      setNovaDisponibilidade({
        dia: 'Seg',
        horario_inicio: '',
        horario_fim: ''
      });
    }
  };

  const removerDisponibilidade = (index) => {
    setFormData({
      ...formData,
      disponibilidade: formData.disponibilidade.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/users/profile`, formData, { headers });
      if (onComplete) {
        onComplete();
      } else {
        alert('Perfil salvo com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-violet-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete seu Perfil
          </h1>
          <p className="text-lg text-gray-600">
            Conte-nos sobre você para conectarmos você com os tutores ideais
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 ${
                    step > s ? 'bg-violet-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && 'Informações Básicas'}
              {step === 2 && 'Disciplinas que você domina'}
              {step === 3 && 'Disciplinas que você precisa'}
              {step === 4 && 'Sua Disponibilidade'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Conte um pouco sobre você'}
              {step === 2 && 'Adicione as matérias que você pode ensinar'}
              {step === 3 && 'Adicione as matérias que você quer aprender'}
              {step === 4 && 'Quando você está disponível para sessões?'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Informações Básicas */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="localizacao" className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Localização
                  </Label>
                  <Input
                    id="localizacao"
                    placeholder="Ex: São Paulo, SP"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você, seus interesses e objetivos..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length}/500 caracteres
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Disciplinas Dominadas */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-violet-900">Seja um Tutor!</h3>
                      <p className="text-sm text-violet-700">
                        Compartilhe seu conhecimento e ajude outros estudantes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Adicionar Disciplina</Label>
                  <div className="flex gap-2">
                    <Select
                      value={novaDisciplinaDomina}
                      onValueChange={setNovaDisciplinaDomina}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCIPLINAS_SUGERIDAS.map((disc) => (
                          <SelectItem key={disc} value={disc}>
                            {disc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={nivelDomina} onValueChange={setNivelDomina}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEIS.map((nivel) => (
                          <SelectItem key={nivel} value={nivel}>
                            {nivel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={adicionarDisciplinaDomina}
                      size="icon"
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Ou digite uma disciplina personalizada"
                    value={novaDisciplinaDomina}
                    onChange={(e) => setNovaDisciplinaDomina(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplinaDomina()}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Suas Disciplinas ({formData.disciplinas_dominadas.length})</Label>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg bg-gray-50">
                    {formData.disciplinas_dominadas.length > 0 ? (
                      formData.disciplinas_dominadas.map((disc, index) => (
                        <Badge
                          key={index}
                          className="bg-violet-100 text-violet-700 hover:bg-violet-200 pr-1 text-sm"
                        >
                          {disc.disciplina} - {disc.nivel}
                          <button
                            onClick={() => removerDisciplinaDomina(index)}
                            className="ml-2 hover:bg-violet-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Nenhuma disciplina adicionada ainda
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Disciplinas que Precisa */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-indigo-900">Precisa de Ajuda?</h3>
                      <p className="text-sm text-indigo-700">
                        Encontre tutores especializados nas matérias que você quer aprender
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Adicionar Disciplina</Label>
                  <div className="flex gap-2">
                    <Select
                      value={novaDisciplinaPrecisa}
                      onValueChange={setNovaDisciplinaPrecisa}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCIPLINAS_SUGERIDAS.map((disc) => (
                          <SelectItem key={disc} value={disc}>
                            {disc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={nivelPrecisa} onValueChange={setNivelPrecisa}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEIS.map((nivel) => (
                          <SelectItem key={nivel} value={nivel}>
                            {nivel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={adicionarDisciplinaPrecisa}
                      size="icon"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Ou digite uma disciplina personalizada"
                    value={novaDisciplinaPrecisa}
                    onChange={(e) => setNovaDisciplinaPrecisa(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplinaPrecisa()}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Disciplinas que Precisa ({formData.disciplinas_precisa.length})</Label>
                  <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg bg-gray-50">
                    {formData.disciplinas_precisa.length > 0 ? (
                      formData.disciplinas_precisa.map((disc, index) => (
                        <Badge
                          key={index}
                          className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 pr-1 text-sm"
                        >
                          {disc.disciplina} - {disc.nivel_desejado}
                          <button
                            onClick={() => removerDisciplinaPrecisa(index)}
                            className="ml-2 hover:bg-indigo-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Nenhuma disciplina adicionada ainda
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Disponibilidade */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Defina seus Horários</h3>
                      <p className="text-sm text-green-700">
                        Isso ajudará outros alunos a encontrarem o melhor momento para agendar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Adicionar Horário</Label>
                  <div className="grid grid-cols-4 gap-2">
                    <Select
                      value={novaDisponibilidade.dia}
                      onValueChange={(dia) => setNovaDisponibilidade({ ...novaDisponibilidade, dia })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA.map((dia) => (
                          <SelectItem key={dia} value={dia}>
                            {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={novaDisponibilidade.horario_inicio}
                      onChange={(e) =>
                        setNovaDisponibilidade({ ...novaDisponibilidade, horario_inicio: e.target.value })
                      }
                    />
                    <Input
                      type="time"
                      value={novaDisponibilidade.horario_fim}
                      onChange={(e) =>
                        setNovaDisponibilidade({ ...novaDisponibilidade, horario_fim: e.target.value })
                      }
                    />
                    <Button
                      onClick={adicionarDisponibilidade}
                      size="icon"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sua Disponibilidade ({formData.disponibilidade.length})</Label>
                  <div className="space-y-2 min-h-[60px] p-3 border rounded-lg bg-gray-50">
                    {formData.disponibilidade.length > 0 ? (
                      formData.disponibilidade.map((disp, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-2 rounded border"
                        >
                          <span className="text-sm">
                            <strong>{disp.dia}</strong>: {disp.horario_inicio} - {disp.horario_fim}
                          </span>
                          <button
                            onClick={() => removerDisponibilidade(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Nenhum horário adicionado ainda
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
              >
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Perfil
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfileSetup;