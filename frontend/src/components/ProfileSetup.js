import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, X, BookOpen, GraduationCap, MapPin, Sparkles, Save, Loader2, Check } from 'lucide-react';

const API_URL = 'http://localhost:5001';

const DISCIPLINAS_SUGERIDAS = [
  'Cálculo I', 'Cálculo II', 'Cálculo III', 'Álgebra Linear', 'Geometria Analítica',
  'Física I', 'Física II', 'Física III', 'Química Geral', 'Química Orgânica',
  'Programação I', 'Estrutura de Dados', 'Banco de Dados', 'Algoritmos',
  'Estatística', 'Probabilidade', 'Biologia', 'Genética', 'Anatomia',
  'História', 'Geografia', 'Filosofia', 'Inglês', 'Espanhol', 'Português'
].sort();

const NIVEIS = ['Básico', 'Intermediário', 'Avançado'];

function ProfileSetup({ token, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    bio: '', localizacao: '', isTutor: false,
    disciplinas_dominadas: [], disciplinas_precisa: []
  });

  const [novaDisciplinaDomina, setNovaDisciplinaDomina] = useState('');
  const [nivelDomina, setNivelDomina] = useState('Intermediário');
  const [novaDisciplinaPrecisa, setNovaDisciplinaPrecisa] = useState('');
  const [nivelPrecisa, setNivelPrecisa] = useState('Básico');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, { headers });
      setFormData({
        bio: response.data.bio || '', localizacao: response.data.localizacao || '',
        isTutor: response.data.isTutor || false,
        disciplinas_dominadas: response.data.disciplinas_dominadas || [],
        disciplinas_precisa: response.data.disciplinas_precisa || []
      });
    } catch (error) { console.error(error); }
    finally { setLoadingProfile(false); }
  };

  const adicionarDisciplinaDomina = () => {
    if (!novaDisciplinaDomina.trim()) return;
    if (formData.disciplinas_dominadas.some(d => d.disciplina.toLowerCase() === novaDisciplinaDomina.toLowerCase())) {
      toast.error('Já adicionada'); return;
    }
    setFormData({ ...formData, disciplinas_dominadas: [...formData.disciplinas_dominadas, { disciplina: novaDisciplinaDomina, nivel: nivelDomina }] });
    setNovaDisciplinaDomina('');
  };

  const adicionarDisciplinaPrecisa = () => {
    if (!novaDisciplinaPrecisa.trim()) return;
    if (formData.disciplinas_precisa.some(d => d.disciplina.toLowerCase() === novaDisciplinaPrecisa.toLowerCase())) {
      toast.error('Já adicionada'); return;
    }
    setFormData({ ...formData, disciplinas_precisa: [...formData.disciplinas_precisa, { disciplina: novaDisciplinaPrecisa, nivel_desejado: nivelPrecisa }] });
    setNovaDisciplinaPrecisa('');
  };

  const handleSave = async () => {
    if (formData.disciplinas_precisa.length === 0) { toast.error('Adicione pelo menos uma disciplina que você precisa'); return; }
    if (formData.isTutor && formData.disciplinas_dominadas.length === 0) { toast.error('Como tutor, adicione disciplinas que você domina'); return; }
    try {
      setLoading(true);
      await axios.put(`${API_URL}/users/profile`, formData, { headers });
      toast.success('Perfil salvo!');
      if (onComplete) onComplete();
    } catch (error) { toast.error('Erro ao salvar'); }
    finally { setLoading(false); }
  };

  const getTotalSteps = () => formData.isTutor ? 3 : 2;
  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return formData.disciplinas_precisa.length > 0;
    if (step === 3 && formData.isTutor) return formData.disciplinas_dominadas.length > 0;
    return true;
  };

  if (loadingProfile) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-violet-600" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4"><Sparkles className="w-8 h-8 text-white" /></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete seu Perfil</h1>
          <p className="text-gray-600">Configure seu perfil para começar</p>
        </div>

        <div className="flex items-center justify-center mb-8 gap-2">
          {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step > s ? 'bg-violet-600 text-white' : step === s ? 'bg-violet-600 text-white ring-4 ring-violet-200' : 'bg-white text-gray-400 border-2'}`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < getTotalSteps() && <div className={`w-12 h-1 ${step > s ? 'bg-violet-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 && 'Como você quer usar o Tutor Connect?'}
              {step === 2 && 'O que você quer aprender?'}
              {step === 3 && formData.isTutor && 'O que você pode ensinar?'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Escolha se quer apenas aprender ou também ensinar'}
              {step === 2 && 'Adicione disciplinas que você precisa de ajuda'}
              {step === 3 && formData.isTutor && 'Adicione disciplinas que você domina'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <button onClick={() => setFormData({ ...formData, isTutor: false })} className={`p-6 rounded-xl border-2 text-left transition-all ${!formData.isTutor ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${!formData.isTutor ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'}`}><BookOpen className="w-6 h-6" /></div>
                      <div className="flex-1"><h3 className="font-semibold text-gray-900 mb-1">Quero aprender</h3><p className="text-sm text-gray-600">Encontre tutores para aprender</p></div>
                      {!formData.isTutor && <Check className="w-6 h-6 text-violet-600" />}
                    </div>
                  </button>
                  <button onClick={() => setFormData({ ...formData, isTutor: true })} className={`p-6 rounded-xl border-2 text-left transition-all ${formData.isTutor ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.isTutor ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'}`}><GraduationCap className="w-6 h-6" /></div>
                      <div className="flex-1"><h3 className="font-semibold text-gray-900 mb-1">Quero aprender e ensinar</h3><p className="text-sm text-gray-600">Compartilhe conhecimento ajudando outros</p></div>
                      {formData.isTutor && <Check className="w-6 h-6 text-violet-600" />}
                    </div>
                  </button>
                </div>
                <div className="pt-4 space-y-4">
                  <div><Label className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" />Localização (opcional)</Label><Input placeholder="Ex: São Paulo, SP" value={formData.localizacao} onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })} /></div>
                  <div><Label className="mb-2 block">Bio (opcional)</Label><Textarea placeholder="Sobre você..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} maxLength={500} /></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={novaDisciplinaPrecisa} onValueChange={setNovaDisciplinaPrecisa}><SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{DISCIPLINAS_SUGERIDAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                  <Select value={nivelPrecisa} onValueChange={setNivelPrecisa}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
                  <Button onClick={adicionarDisciplinaPrecisa} size="icon" className="bg-violet-600"><Plus className="w-4 h-4" /></Button>
                </div>
                <Input placeholder="Ou digite uma disciplina" value={novaDisciplinaPrecisa} onChange={(e) => setNovaDisciplinaPrecisa(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplinaPrecisa()} />
                <div className="flex flex-wrap gap-2 min-h-[80px] p-4 border rounded-xl bg-gray-50">
                  {formData.disciplinas_precisa.length > 0 ? formData.disciplinas_precisa.map((d, i) => (
                    <Badge key={i} className="bg-indigo-100 text-indigo-700 pr-1 py-1.5">{d.disciplina} • {d.nivel_desejado}<button onClick={() => setFormData({ ...formData, disciplinas_precisa: formData.disciplinas_precisa.filter((_, idx) => idx !== i) })} className="ml-2"><X className="w-3 h-3" /></button></Badge>
                  )) : <p className="text-gray-400 text-sm">Adicione pelo menos uma</p>}
                </div>
              </div>
            )}

            {step === 3 && formData.isTutor && (
              <div className="space-y-4">
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4"><div className="flex items-center gap-3"><GraduationCap className="w-5 h-5 text-violet-600" /><p className="text-sm text-violet-700">Adicione disciplinas que você tem conhecimento para ensinar</p></div></div>
                <div className="flex gap-2">
                  <Select value={novaDisciplinaDomina} onValueChange={setNovaDisciplinaDomina}><SelectTrigger className="flex-1"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{DISCIPLINAS_SUGERIDAS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                  <Select value={nivelDomina} onValueChange={setNivelDomina}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{NIVEIS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
                  <Button onClick={adicionarDisciplinaDomina} size="icon" className="bg-violet-600"><Plus className="w-4 h-4" /></Button>
                </div>
                <Input placeholder="Ou digite uma disciplina" value={novaDisciplinaDomina} onChange={(e) => setNovaDisciplinaDomina(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && adicionarDisciplinaDomina()} />
                <div className="flex flex-wrap gap-2 min-h-[80px] p-4 border rounded-xl bg-gray-50">
                  {formData.disciplinas_dominadas.length > 0 ? formData.disciplinas_dominadas.map((d, i) => (
                    <Badge key={i} className="bg-violet-100 text-violet-700 pr-1 py-1.5">{d.disciplina} • {d.nivel}<button onClick={() => setFormData({ ...formData, disciplinas_dominadas: formData.disciplinas_dominadas.filter((_, idx) => idx !== i) })} className="ml-2"><X className="w-3 h-3" /></button></Badge>
                  )) : <p className="text-gray-400 text-sm">Adicione pelo menos uma</p>}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <strong>Dica:</strong> Após concluir, vá em "Meu Perfil" para adicionar suas datas e horários disponíveis para tutorias.
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Voltar</Button>
              {step < getTotalSteps() ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="bg-violet-600 hover:bg-violet-700">Próximo</Button>
              ) : (
                <Button onClick={handleSave} disabled={loading || !canProceed()} className="bg-gradient-to-r from-violet-600 to-indigo-600">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : <><Save className="w-4 h-4 mr-2" />Concluir</>}
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
