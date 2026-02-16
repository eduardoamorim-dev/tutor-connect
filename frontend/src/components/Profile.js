import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import usersApi from "../api/services/usersApi";
import { useInstitutions, usePrograms } from "../hooks/useInstitutionsPrograms";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  Calendar as CalendarIcon,
  Building2,
  FileText,
} from "lucide-react";

const DISCIPLINAS_SUGERIDAS = [
  "Cálculo I",
  "Cálculo II",
  "Cálculo III",
  "Álgebra Linear",
  "Geometria Analítica",
  "Física I",
  "Física II",
  "Física III",
  "Química Geral",
  "Química Orgânica",
  "Programação I",
  "Estrutura de Dados",
  "Banco de Dados",
  "Algoritmos",
  "Estatística",
  "Probabilidade",
  "Biologia",
  "Genética",
  "Anatomia",
  "História",
  "Geografia",
  "Filosofia",
  "Inglês",
  "Espanhol",
  "Português",
].sort();

const NIVEIS = ["Básico", "Intermediário", "Avançado"];

function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingDisponibilidade, setSavingDisponibilidade] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    localizacao: "",
    isTutor: false,
    disciplinas_dominadas: [],
    disciplinas_precisa: [],
    disponibilidade: [],
    // Academic profile fields
    nivel_academico: "graduacao",
    instituicao: "",
    programa: "",
    lattes_url: "",
    orcid: "",
    linha_pesquisa: "",
    area_concentracao: "",
  });

  // Fetch institutions and programs
  const { data: institutions } = useInstitutions({ ativo: true });
  const { data: programs } = usePrograms({
    ...(formData.instituicao && { instituicaoId: formData.instituicao }),
    ativo: true,
  });

  const [novaDisciplinaDomina, setNovaDisciplinaDomina] = useState("");
  const [nivelDomina, setNivelDomina] = useState("Intermediário");

  const [novaDisciplinaPrecisa, setNovaDisciplinaPrecisa] = useState("");
  const [nivelPrecisa, setNivelPrecisa] = useState("Básico");

  const [novaDisponibilidade, setNovaDisponibilidade] = useState({
    data: "",
    dataBR: "", // Formato DD/MM/YYYY para exibição
    horario_inicio: "08:00",
    horario_fim: "12:00",
  });

  const [stats, setStats] = useState({
    totalSessoes: 0,
    rating: 0,
    totalAvaliacoes: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await usersApi.getProfile();
      const data = response.data;
      setFormData({
        bio: data.bio || "",
        localizacao: data.localizacao || "",
        isTutor: data.isTutor || false,
        disciplinas_dominadas: data.disciplinas_dominadas || [],
        disciplinas_precisa: data.disciplinas_precisa || [],
        disponibilidade: data.disponibilidade || [],
        nivel_academico: data.nivel_academico || "graduacao",
        instituicao: data.instituicao?._id || "",
        programa: data.programa?._id || "",
        lattes_url: data.lattes_url || "",
        orcid: data.orcid || "",
        linha_pesquisa: data.linha_pesquisa || "",
        area_concentracao: data.area_concentracao || "",
      });
      setStats({
        totalSessoes: data.total_sessoes || 0,
        rating: data.rating || 0,
        totalAvaliacoes: data.total_avaliacoes || 0,
      });
    } catch (error) {
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoadingProfile(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr) => {
    // Adiciona T12:00:00 para evitar problemas de timezone
    const date = new Date(dateStr);
    // Ajusta para timezone local
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Máscara para input de data DD/MM/YYYY
  const handleDataChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito

    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }

    setNovaDisponibilidade({
      ...novaDisponibilidade,
      dataBR: value,
      data: "", // Limpa enquanto digita
    });

    // Quando completar DD/MM/YYYY, converte para YYYY-MM-DD
    if (value.length === 10) {
      const [dia, mes, ano] = value.split("/");
      const dataISO = `${ano}-${mes}-${dia}`;

      // Valida se é uma data válida
      const dateTest = new Date(dataISO);
      if (!isNaN(dateTest.getTime())) {
        setNovaDisponibilidade({
          ...novaDisponibilidade,
          dataBR: value,
          data: dataISO,
        });
      }
    }
  };

  const adicionarDisciplinaDomina = () => {
    if (novaDisciplinaDomina.trim()) {
      const existe = formData.disciplinas_dominadas.some(
        (d) => d.disciplina.toLowerCase() === novaDisciplinaDomina.toLowerCase(),
      );
      if (existe) {
        toast.error("Disciplina já adicionada");
        return;
      }
      setFormData({
        ...formData,
        disciplinas_dominadas: [
          ...formData.disciplinas_dominadas,
          { disciplina: novaDisciplinaDomina, nivel: nivelDomina },
        ],
      });
      setNovaDisciplinaDomina("");
    }
  };

  const removerDisciplinaDomina = (index) => {
    setFormData({
      ...formData,
      disciplinas_dominadas: formData.disciplinas_dominadas.filter((_, i) => i !== index),
    });
  };

  const adicionarDisciplinaPrecisa = () => {
    if (novaDisciplinaPrecisa.trim()) {
      const existe = formData.disciplinas_precisa.some(
        (d) => d.disciplina.toLowerCase() === novaDisciplinaPrecisa.toLowerCase(),
      );
      if (existe) {
        toast.error("Disciplina já adicionada");
        return;
      }
      setFormData({
        ...formData,
        disciplinas_precisa: [
          ...formData.disciplinas_precisa,
          { disciplina: novaDisciplinaPrecisa, nivel_desejado: nivelPrecisa },
        ],
      });
      setNovaDisciplinaPrecisa("");
    }
  };

  const removerDisciplinaPrecisa = (index) => {
    setFormData({
      ...formData,
      disciplinas_precisa: formData.disciplinas_precisa.filter((_, i) => i !== index),
    });
  };

  const adicionarDisponibilidade = async () => {
    if (
      !novaDisponibilidade.data ||
      !novaDisponibilidade.horario_inicio ||
      !novaDisponibilidade.horario_fim
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (novaDisponibilidade.horario_inicio >= novaDisponibilidade.horario_fim) {
      toast.error("Horário de início deve ser antes do fim");
      return;
    }

    try {
      setSavingDisponibilidade(true);
      const response = await usersApi.addDisponibilidade({
        data: novaDisponibilidade.data,
        horario_inicio: novaDisponibilidade.horario_inicio,
        horario_fim: novaDisponibilidade.horario_fim,
      });
      setFormData({
        ...formData,
        disponibilidade: response.data.disponibilidade,
      });
      setNovaDisponibilidade({
        data: "",
        dataBR: "",
        horario_inicio: "08:00",
        horario_fim: "12:00",
      });
      toast.success("Disponibilidade adicionada!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao adicionar");
    } finally {
      setSavingDisponibilidade(false);
    }
  };

  const removerDisponibilidade = async (id) => {
    try {
      const response = await usersApi.removeDisponibilidade(id);
      setFormData({
        ...formData,
        disponibilidade: response.data.disponibilidade,
      });
      toast.success("Disponibilidade removida");
    } catch (error) {
      toast.error("Erro ao remover");
    }
  };

  const handleSave = async () => {
    // Permitir salvar perfil como tutor mesmo sem disciplinas
    if (formData.isTutor && formData.disciplinas_dominadas.length === 0) {
      toast.warning(
        "Você será listado como tutor, mas precisa adicionar disciplinas para aparecer nas buscas.",
      );
    }
    try {
      setLoading(true);
      // Update basic profile
      await usersApi.updateProfile({
        bio: formData.bio,
        localizacao: formData.localizacao,
        isTutor: formData.isTutor,
        disciplinas_dominadas: formData.disciplinas_dominadas,
        disciplinas_precisa: formData.disciplinas_precisa,
      });

      // Prepare academic profile data
      const academicData = {
        nivel_academico: formData.nivel_academico,
      };

      // Only add fields if they have values
      if (formData.instituicao) {
        academicData.instituicaoId = formData.instituicao;
      }
      if (formData.programa) {
        academicData.programaId = formData.programa;
      }
      if (formData.lattes_url && formData.lattes_url.trim()) {
        academicData.lattes_url = formData.lattes_url.trim();
      }
      if (formData.orcid && formData.orcid.trim()) {
        academicData.orcid = formData.orcid.trim();
      }
      if (formData.linha_pesquisa && formData.linha_pesquisa.trim()) {
        academicData.linha_pesquisa = formData.linha_pesquisa.trim();
      }
      if (formData.area_concentracao && formData.area_concentracao.trim()) {
        academicData.area_concentracao = formData.area_concentracao.trim();
      }

      // Update academic profile
      await usersApi.updateAcademicProfile(academicData);

      toast.success("Perfil atualizado!");
      refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const agora = new Date();

  const disponibilidadesPorData = formData.disponibilidade.reduce((acc, disp) => {
    // Usar hora local para consistência com timezone brasileiro
    const date = new Date(disp.data);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Verificar se o horário já passou
    const [horaFim, minFim] = disp.horario_fim.split(":").map(Number);
    const dataHoraFim = new Date(
      year,
      date.getMonth(),
      date.getDate(),
      horaFim,
      minFim,
      0,
      0,
    );

    // Só adiciona se ainda não passou
    if (dataHoraFim > agora) {
      const dataKey = `${year}-${month}-${day}`;
      if (!acc[dataKey]) acc[dataKey] = [];
      acc[dataKey].push(disp);
    }

    return acc;
  }, {});

  const datasOrdenadas = Object.keys(disponibilidadesPorData).sort();

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
                <Badge
                  className={
                    formData.isTutor ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-700"
                  }
                >
                  {formData.isTutor ? "Tutor" : "Aluno"}
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
        <CardHeader>
          <CardTitle className="text-lg">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" />
              Localização
            </Label>
            <Input
              placeholder="Ex: São Paulo, SP"
              value={formData.localizacao}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-2 block">Bio</Label>
            <Textarea
              placeholder="Conte um pouco sobre você..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isTutor"
              checked={formData.isTutor}
              onChange={(e) => setFormData({ ...formData, isTutor: e.target.checked })}
              className="w-5 h-5 accent-violet-600 rounded"
            />
            <div>
              <Label htmlFor="isTutor" className="font-medium cursor-pointer">
                Quero ser tutor
              </Label>
              <p className="text-sm text-gray-500">Ative para poder dar aulas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Perfil Acadêmico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Informações acadêmicas opcionais. Para estudantes de pós-graduação que desejam
            acompanhamento de horas de docência.
          </div>

          <div>
            <Label className="mb-2 block">Nível Acadêmico</Label>
            <Select
              value={formData.nivel_academico}
              onValueChange={(value) => setFormData({ ...formData, nivel_academico: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="graduacao">Graduação</SelectItem>
                <SelectItem value="mestrado">Mestrado</SelectItem>
                <SelectItem value="doutorado">Doutorado</SelectItem>
                <SelectItem value="pos-doutorado">Pós-doutorado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.nivel_academico === "mestrado" ||
            formData.nivel_academico === "doutorado" ||
            formData.nivel_academico === "pos-doutorado") && (
            <>
              <div>
                <Label className="mb-2 block">Instituição</Label>
                <Select
                  value={formData.instituicao}
                  onValueChange={(value) =>
                    setFormData({ ...formData, instituicao: value, programa: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.data?.map((inst) => (
                      <SelectItem key={inst._id} value={inst._id}>
                        {inst.nome} ({inst.sigla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.instituicao && (
                <div>
                  <Label className="mb-2 block">Programa</Label>
                  <Select
                    value={formData.programa}
                    onValueChange={(value) => setFormData({ ...formData, programa: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o programa" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs?.data?.map((prog) => (
                        <SelectItem key={prog._id} value={prog._id}>
                          {prog.nome} - {prog.nivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Currículo Lattes (URL)
                  </Label>
                  <Input
                    placeholder="https://lattes.cnpq.br/..."
                    value={formData.lattes_url}
                    onChange={(e) => setFormData({ ...formData, lattes_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">ORCID</Label>
                  <Input
                    placeholder="0000-0000-0000-0000"
                    value={formData.orcid}
                    onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Área de Concentração</Label>
                <Input
                  placeholder="Ex: Ciência da Computação"
                  value={formData.area_concentracao}
                  maxLength={200}
                  onChange={(e) => setFormData({ ...formData, area_concentracao: e.target.value })}
                />
              </div>

              <div>
                <Label className="mb-2 block">Linha de Pesquisa</Label>
                <Textarea
                  placeholder="Descreva sua linha de pesquisa..."
                  value={formData.linha_pesquisa}
                  onChange={(e) => setFormData({ ...formData, linha_pesquisa: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Disciplinas que Preciso Aprender
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={novaDisciplinaPrecisa} onValueChange={setNovaDisciplinaPrecisa}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {DISCIPLINAS_SUGERIDAS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={nivelPrecisa} onValueChange={setNivelPrecisa}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NIVEIS.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={adicionarDisciplinaPrecisa} size="icon" className="bg-violet-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {formData.disciplinas_precisa.map((d, i) => (
              <Badge key={i} className="bg-indigo-100 text-indigo-700 pr-1 py-1">
                {d.disciplina} • {d.nivel_desejado}
                <button onClick={() => removerDisciplinaPrecisa(i)} className="ml-2">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {formData.isTutor && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Disciplinas que Posso Ensinar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={novaDisciplinaDomina} onValueChange={setNovaDisciplinaDomina}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS_SUGERIDAS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={nivelDomina} onValueChange={setNivelDomina}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NIVEIS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={adicionarDisciplinaDomina} size="icon" className="bg-violet-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {formData.disciplinas_dominadas.map((d, i) => (
                <Badge key={i} className="bg-violet-100 text-violet-700 pr-1 py-1">
                  {d.disciplina} • {d.nivel}
                  <button onClick={() => removerDisciplinaDomina(i)} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
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
              <Clock className="w-5 h-5" />
              Minha Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Adicione as datas e horários em que você está disponível para dar tutorias.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Data <span className="text-gray-400">(dia/mês/ano)</span>
                </Label>
                <Input
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={novaDisponibilidade.dataBR}
                  maxLength={10}
                  onChange={handleDataChange}
                  className={!novaDisponibilidade.data && novaDisponibilidade.dataBR ? "border-red-300" : ""}
                />
                {!novaDisponibilidade.data && novaDisponibilidade.dataBR && (
                  <p className="text-xs text-red-500 mt-1">Data inválida</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Início</Label>
                <Input
                  type="time"
                  value={novaDisponibilidade.horario_inicio}
                  onChange={(e) =>
                    setNovaDisponibilidade({
                      ...novaDisponibilidade,
                      horario_inicio: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Fim</Label>
                <Input
                  type="time"
                  value={novaDisponibilidade.horario_fim}
                  onChange={(e) =>
                    setNovaDisponibilidade({
                      ...novaDisponibilidade,
                      horario_fim: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={adicionarDisponibilidade}
                  disabled={savingDisponibilidade}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {savingDisponibilidade ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {datasOrdenadas.length > 0 ? (
                datasOrdenadas.map((dataKey) => (
                  <div key={dataKey} className="border rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">{formatDate(dataKey)}</div>
                    <div className="flex flex-wrap gap-2">
                      {disponibilidadesPorData[dataKey].map((disp) => (
                        <div
                          key={disp._id}
                          className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          <Clock className="w-3 h-3" />
                          {disp.horario_inicio} - {disp.horario_fim}
                          <button
                            onClick={() => removerDisponibilidade(disp._id)}
                            className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                          >
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
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default Profile;
