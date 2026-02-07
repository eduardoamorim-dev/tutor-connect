import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Calendar,
  Clock,
  Video,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getInitials, formatDate, formatTime, getStatusColor } from "./utils";

function SessionCard({
  sessao,
  userId,
  onConfirm,
  onComplete,
  onCancel,
  onRate,
  index = 0,
}) {
  const isTutor = sessao.tutor._id === userId;
  const outra = isTutor ? sessao.aluno : sessao.tutor;
  const isPast = new Date(sessao.data_hora_fim) < new Date();

  return (
    <Card
      className="hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
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
                <h3 className="font-semibold text-lg">{sessao.disciplina}</h3>
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
                    onClick={() => window.open(sessao.link_meet, "_blank")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Meet
                  </Button>
                )}
              {isTutor && sessao.status === "Pendente" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onConfirm(sessao._id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              )}
              {sessao.status === "Confirmada" && isPast && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onComplete(sessao._id)}
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
                    onClick={() => onRate(sessao)}
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
                    onClick={() => onCancel(sessao)}
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
}

export default SessionCard;
