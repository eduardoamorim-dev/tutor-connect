import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Calendar, Loader2, Star, MapPin, MessageSquare } from "lucide-react";
import { getInitials } from "./utils";

function TutorDetailsModal({ tutor, avaliacoes, loadingAvaliacoes, open, onClose, onSchedule }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Tutor</DialogTitle>
        </DialogHeader>

        {tutor && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-violet-50 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-violet-200 text-violet-700 text-xl">
                  {getInitials(tutor.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{tutor.nome}</h3>
                {tutor.localizacao && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {tutor.localizacao}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {tutor.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-lg">{tutor.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({tutor.total_avaliacoes})</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {tutor.total_sessoes || 0} sessoes realizadas
                  </div>
                </div>
              </div>
            </div>

            {tutor.bio && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sobre</h4>
                <p className="text-gray-600 text-sm">{tutor.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Disciplinas que ensina</h4>
              <div className="flex flex-wrap gap-2">
                {tutor.disciplinas_dominadas.map((d, i) => (
                  <Badge key={i} className="bg-violet-100 text-violet-700">
                    {d.disciplina} • {d.nivel}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Avaliacoes e Comentarios
              </h4>

              {loadingAvaliacoes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                </div>
              ) : avaliacoes.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {avaliacoes.map((avaliacao) => (
                    <div key={avaliacao._id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {getInitials(avaliacao.aluno?.nome || "Anonimo")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {avaliacao.aluno?.nome || "Anonimo"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {avaliacao.sessao?.disciplina && `${avaliacao.sessao.disciplina} • `}
                              {new Date(avaliacao.data).toLocaleDateString("pt-BR")}
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
                        <p className="text-gray-600 text-sm mt-2 pl-10">"{avaliacao.comentario}"</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border rounded-lg">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma avaliacao ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onClose(false)}>
            Fechar
          </Button>
          {tutor?.disponibilidade?.length > 0 && (
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => onSchedule(tutor)}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Sessao
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TutorDetailsModal;
