import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Clock, Loader2, Star } from "lucide-react";
import { getInitials, formatDateFull } from "./utils";

function ScheduleModal({
  tutor,
  disponibilidades,
  loadingDisponibilidade,
  open,
  onClose,
  onSubmit,
}) {
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [form, setForm] = useState({ disciplina: "", observacoes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tutor && open) {
      setForm({
        disciplina: tutor.disciplinas_dominadas[0]?.disciplina || "",
        observacoes: "",
      });
      setSlotSelecionado(null);
    }
  }, [tutor, open]);

  const agora = new Date();

  const disponibilidadesPorData = useMemo(() => {
    return disponibilidades.reduce((acc, d) => {
      const date = new Date(d.data);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");

      const [horaFim, minFim] = d.horario_fim.split(":").map(Number);
      const dataHoraFim = new Date(
        year,
        date.getUTCMonth(),
        date.getUTCDate(),
        horaFim,
        minFim,
        0,
        0,
      );

      if (dataHoraFim > agora) {
        const k = `${year}-${month}-${day}`;
        if (!acc[k]) acc[k] = [];
        acc[k].push(d);
      }

      return acc;
    }, {});
  }, [disponibilidades]);

  const datasDisponiveis = Object.keys(disponibilidadesPorData).sort();

  const handleSubmit = async () => {
    if (!form.disciplina || !slotSelecionado) return;
    setSubmitting(true);
    try {
      await onSubmit({
        tutorId: tutor._id,
        disciplina: form.disciplina,
        slot: slotSelecionado,
        observacoes: form.observacoes,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Sessao</DialogTitle>
          <DialogDescription>
            {tutor && (
              <div className="flex items-center gap-3 mt-3 p-3 bg-violet-50 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-violet-100 text-violet-700">
                    {getInitials(tutor.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{tutor.nome}</p>
                  {tutor.rating > 0 && (
                    <p className="text-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {tutor.rating.toFixed(1)}
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
              value={form.disciplina}
              onValueChange={(v) => setForm({ ...form, disciplina: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {tutor?.disciplinas_dominadas.map((d, i) => (
                  <SelectItem key={i} value={d.disciplina}>
                    {d.disciplina} - {d.nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Selecione um horario</Label>
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
                <p>Sem horarios disponiveis</p>
              </div>
            )}
          </div>
          {slotSelecionado && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
              <p className="text-sm text-violet-700">
                <strong>Selecionado:</strong> {formatDateFull(slotSelecionado.data)} das{" "}
                {slotSelecionado.horario_inicio} as {slotSelecionado.horario_fim}
              </p>
            </div>
          )}
          <div>
            <Label>Observacoes (opcional)</Label>
            <Textarea
              placeholder="Observacoes..."
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !slotSelecionado}
            className="bg-violet-600"
          >
            {submitting ? (
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
  );
}

export default ScheduleModal;
