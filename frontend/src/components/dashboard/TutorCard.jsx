import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Calendar, Star, MapPin, Eye } from "lucide-react";
import { getInitials } from "./utils";

function TutorCard({ tutor, onViewProfile, onSchedule, index = 0 }) {
  return (
    <Card
      className="hover:shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-violet-100 text-lg text-violet-700">
              {getInitials(tutor.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center w-full">
            <h3 className="text-xl font-semibold">{tutor.nome}</h3>
            {tutor.localizacao && (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {tutor.localizacao}
              </p>
            )}
            {tutor.rating > 0 && (
              <button
                onClick={() => onViewProfile(tutor)}
                className="flex items-center justify-center gap-1 mt-2 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
              >
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {tutor.rating.toFixed(1)}
                </span>
                <span className="text-gray-400 text-sm">
                  ({tutor.total_avaliacoes}{" "}
                  {tutor.total_avaliacoes === 1
                    ? "avaliacao"
                    : "avaliacoes"}
                  )
                </span>
              </button>
            )}
          </div>
          <div className="w-full">
            <p className="text-sm text-gray-500 mb-2">Disciplinas:</p>
            <div className="flex flex-wrap gap-2">
              {tutor.disciplinas_dominadas.slice(0, 3).map((d, i) => (
                <Badge key={i} className="bg-violet-100 text-violet-700">
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
              onClick={() => onViewProfile(tutor)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Perfil
            </Button>
            {tutor.disponibilidade?.length > 0 ? (
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={() => onSchedule(tutor)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            ) : (
              <Button className="flex-1" disabled variant="outline">
                Sem horarios
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TutorCard;
