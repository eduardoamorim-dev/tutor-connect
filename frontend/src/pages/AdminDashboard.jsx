import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useInstitutions, usePrograms } from "../hooks/useInstitutionsPrograms";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Building2, GraduationCap, Plus, Search, Edit2, Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { createInstitution, updateInstitution } from "../api/instituicoes";
import { createProgram, updateProgram, assignCoordinator } from "../api/programas";
import usersApi from "../api/services/usersApi";
import { useQueryClient } from "@tanstack/react-query";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("institutions");
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Você precisa ser administrador para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerenciar instituições, programas e coordenadores</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab("institutions")}
            className={`pb-4 px-2 font-medium relative transition-all duration-300 ${
              activeTab === "institutions" ? "text-violet-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Instituições
            </div>
            {activeTab === "institutions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`pb-4 px-2 font-medium relative transition-all duration-300 ${
              activeTab === "programs" ? "text-violet-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Programas
            </div>
            {activeTab === "programs" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-2 font-medium relative transition-all duration-300 ${
              activeTab === "users" ? "text-violet-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários
            </div>
            {activeTab === "users" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "institutions" && (
          <InstitutionsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}
        {activeTab === "programs" && (
          <ProgramsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}
        {activeTab === "users" && (
          <UsersTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}
      </div>
    </div>
  );
};

// Institutions Tab Component
const InstitutionsTab = ({ searchTerm, setSearchTerm }) => {
  const queryClient = useQueryClient();
  const { data: institutions, isLoading } = useInstitutions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);

  const institutionsList = institutions?.data || [];
  const filteredInstitutions = institutionsList.filter(
    (inst) =>
      inst.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.sigla.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getTipoLabel = (tipo) => {
    const tipos = {
      publica: "Pública",
      privada: "Privada",
      federal: "Federal",
      estadual: "Estadual",
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div>
      {/* Search and Create */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar instituições..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Instituição
        </Button>
      </div>

      {/* Institutions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstitutions.map((institution) => (
            <Card key={institution._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{institution.nome}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{institution.sigla}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingInstitution(institution)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{getTipoLabel(institution.tipo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mestrado:</span>
                    <span className="font-medium">
                      {institution.configuracoes?.horas_mestrado || 60}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doutorado:</span>
                    <span className="font-medium">
                      {institution.configuracoes?.horas_doutorado || 120}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${institution.ativo ? "text-green-600" : "text-red-600"}`}
                    >
                      {institution.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <InstitutionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ["institutions"] });
          }}
        />
      )}
      {editingInstitution && (
        <InstitutionModal
          institution={editingInstitution}
          onClose={() => setEditingInstitution(null)}
          onSuccess={() => {
            setEditingInstitution(null);
            queryClient.invalidateQueries({ queryKey: ["institutions"] });
          }}
        />
      )}
    </div>
  );
};

// Programs Tab Component
const ProgramsTab = ({ searchTerm, setSearchTerm }) => {
  const queryClient = useQueryClient();
  const { data: programs, isLoading } = usePrograms();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [assigningCoordinator, setAssigningCoordinator] = useState(null);

  const programsList = programs?.data || [];
  const filteredPrograms = programsList.filter((prog) =>
    prog.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Search and Create */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar programas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Programa
        </Button>
      </div>

      {/* Programs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((program) => (
            <Card key={program._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{program.nome}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {program.instituicao?.nome || "N/A"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditingProgram(program)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nível:</span>
                    <span className="font-medium capitalize">{program.nivel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordenador:</span>
                    <span className="font-medium">
                      {program.coordenador?.nome || "Não atribuído"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-medium ${program.ativo ? "text-green-600" : "text-red-600"}`}
                    >
                      {program.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssigningCoordinator(program)}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {program.coordenador ? "Alterar Coordenador" : "Atribuir Coordenador"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProgramModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ["programs"] });
          }}
        />
      )}
      {editingProgram && (
        <ProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onSuccess={() => {
            setEditingProgram(null);
            queryClient.invalidateQueries({ queryKey: ["programs"] });
          }}
        />
      )}
      {assigningCoordinator && (
        <CoordinatorAssignModal
          program={assigningCoordinator}
          onClose={() => setAssigningCoordinator(null)}
          onSuccess={() => {
            setAssigningCoordinator(null);
            queryClient.invalidateQueries({ queryKey: ["programs"] });
          }}
        />
      )}
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ searchTerm, setSearchTerm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Digite um email para buscar");
      return;
    }

    setLoading(true);
    try {
      const response = await usersApi.searchByEmail(searchTerm);
      setUsers([response.data.user]);
      toast.success("Usuário encontrado!");
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Usuário não encontrado");
        setUsers([]);
      } else {
        toast.error(error.response?.data?.error || "Erro ao buscar usuário");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: "Estudante",
      tutor: "Tutor",
      coordinator: "Coordenador",
      admin: "Administrador",
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: "bg-gray-100 text-gray-700",
      tutor: "bg-blue-100 text-blue-700",
      coordinator: "bg-green-100 text-green-700",
      admin: "bg-purple-100 text-purple-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar usuário por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Buscar
        </Button>
      </div>

      {/* Info message */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Digite o email de um usuário para buscar</p>
        </div>
      )}

      {/* Users List */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <Card key={user._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.nome}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <UserRoleModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(updatedUser) => {
            setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};

// Institution Modal Component
const InstitutionModal = ({ institution, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: institution?.nome || "",
    sigla: institution?.sigla || "",
    tipo: institution?.tipo || "publica",
    ativo: institution?.ativo ?? true,
    horas_mestrado: institution?.configuracoes?.horas_mestrado || 60,
    horas_doutorado: institution?.configuracoes?.horas_doutorado || 120,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        nome: formData.nome,
        sigla: formData.sigla,
        tipo: formData.tipo,
        ativo: formData.ativo,
        configuracoes: {
          horas_mestrado: Number(formData.horas_mestrado),
          horas_doutorado: Number(formData.horas_doutorado),
        },
      };

      if (institution) {
        await updateInstitution(institution._id, data);
        toast.success("Instituição atualizada!");
      } else {
        await createInstitution(data);
        toast.success("Instituição criada!");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar instituição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {institution ? "Editar Instituição" : "Nova Instituição"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome da Instituição</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Sigla</Label>
              <Input
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publica">Pública</SelectItem>
                  <SelectItem value="privada">Privada</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horas Mestrado</Label>
                <Input
                  type="number"
                  value={formData.horas_mestrado}
                  onChange={(e) => setFormData({ ...formData, horas_mestrado: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Horas Doutorado</Label>
                <Input
                  type="number"
                  value={formData.horas_doutorado}
                  onChange={(e) => setFormData({ ...formData, horas_doutorado: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="ativo">Instituição ativa</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-violet-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Program Modal Component
const ProgramModal = ({ program, onClose, onSuccess }) => {
  const { data: institutions } = useInstitutions({ ativo: true });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: program?.nome || "",
    instituicao: program?.instituicao?._id || "",
    nivel: program?.nivel || "mestrado",
    ativo: program?.ativo ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that institution is selected
    if (!formData.instituicao) {
      toast.error("Por favor, selecione uma instituição");
      return;
    }

    setLoading(true);

    try {
      const data = {
        nome: formData.nome,
        instituicaoId: formData.instituicao,
        nivel: formData.nivel,
        ativo: formData.ativo,
      };

      if (program) {
        await updateProgram(program._id, data);
        toast.success("Programa atualizado!");
      } else {
        await createProgram(data);
        toast.success("Programa criado!");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar programa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {program ? "Editar Programa" : "Novo Programa"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome do Programa</Label>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>
                Instituição <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.instituicao}
                onValueChange={(value) => setFormData({ ...formData, instituicao: value })}
                required
              >
                <SelectTrigger className={!formData.instituicao ? "border-red-300" : ""}>
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
              {!formData.instituicao && (
                <p className="text-xs text-red-500 mt-1">Campo obrigatório</p>
              )}
            </div>
            <div>
              <Label>Nível</Label>
              <Select
                value={formData.nivel}
                onValueChange={(value) => setFormData({ ...formData, nivel: value })}
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo-program"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="ativo-program">Programa ativo</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-violet-600">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Coordinator Assign Modal Component
const CoordinatorAssignModal = ({ program, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [foundUser, setFoundUser] = useState(null);

  const handleSearch = async () => {
    if (!userEmail.trim()) {
      toast.error("Por favor, informe o email do usuário");
      return;
    }

    setSearching(true);
    setFoundUser(null);

    try {
      const response = await usersApi.searchByEmail(userEmail);
      setFoundUser(response.data.user);
      toast.success(`Usuário encontrado: ${response.data.user.nome}`);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Usuário não encontrado");
      } else {
        toast.error(error.response?.data?.error || "Erro ao buscar usuário");
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!foundUser) {
      toast.error("Busque e selecione um usuário primeiro");
      return;
    }

    // Check if user has appropriate role
    if (foundUser.role !== "coordinator" && foundUser.role !== "admin") {
      toast.error(
        `O usuário precisa ter role "coordinator" ou "admin". Role atual: ${foundUser.role}`,
      );
      return;
    }

    setLoading(true);

    try {
      await assignCoordinator(program._id, foundUser._id);
      toast.success("Coordenador atribuído com sucesso!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao atribuir coordenador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Atribuir Coordenador</h2>
          <p className="text-gray-600 mb-6">
            Programa: <strong>{program.nome}</strong>
          </p>
          <div className="space-y-4">
            <div>
              <Label>Email do Usuário</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    setFoundUser(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  variant="outline"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                O usuário precisa ter role "coordinator" ou "admin"
              </p>
            </div>

            {foundUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-900">Usuário encontrado:</p>
                <p className="text-sm text-green-700 mt-1">
                  <strong>{foundUser.nome}</strong>
                </p>
                <p className="text-xs text-green-600">
                  {foundUser.email} • Role: {foundUser.role}
                </p>
              </div>
            )}

            {program.coordenador && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <strong>Coordenador atual:</strong> {program.coordenador.nome} (
                {program.coordenador.email})
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAssign}
                disabled={loading || !foundUser}
                className="flex-1 bg-violet-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atribuir"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Role Modal Component
const UserRoleModal = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || "student");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRole === user.role) {
      toast.info("Nenhuma alteração foi feita");
      onClose();
      return;
    }

    setLoading(true);

    try {
      await usersApi.updateUserRole(user._id, selectedRole);
      toast.success("Role atualizado com sucesso!");
      onSuccess({ ...user, role: selectedRole });
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao atualizar role");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "student", label: "Estudante", description: "Acesso básico ao sistema" },
    { value: "tutor", label: "Tutor", description: "Pode dar aulas e ver próprias horas" },
    {
      value: "coordinator",
      label: "Coordenador",
      description: "Pode aprovar horas de programas coordenados",
    },
    { value: "admin", label: "Administrador", description: "Acesso total ao sistema" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Alterar Role do Usuário</h2>
          <div className="mb-4">
            <p className="text-gray-600">
              <strong>{user.nome}</strong>
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-3 block">Selecione o novo role:</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.value
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{role.label}</p>
                      <p className="text-xs text-gray-500">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {selectedRole !== user.role && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                <strong>Atenção:</strong> Alterar o role pode modificar as permissões do usuário no sistema.
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || selectedRole === user.role}
                className="flex-1 bg-violet-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
