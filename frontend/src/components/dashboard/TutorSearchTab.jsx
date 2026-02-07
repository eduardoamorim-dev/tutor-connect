import React from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Users } from "lucide-react";
import TutorCard from "./TutorCard";

function TutorSearchTab({
  tutores,
  searchTerm,
  onSearchChange,
  selectedDisciplina,
  onDisciplinaChange,
  allDisciplinas,
  onViewProfile,
  onSchedule,
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <Select value={selectedDisciplina} onValueChange={onDisciplinaChange}>
          <SelectTrigger className="w-full md:w-64 transition-all duration-300">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {allDisciplinas.map((d, i) => (
              <SelectItem key={i} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutores.length > 0 ? (
          tutores.map((tutor, index) => (
            <TutorCard
              key={tutor._id}
              tutor={tutor}
              index={index}
              onViewProfile={onViewProfile}
              onSchedule={onSchedule}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-gray-500 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhum tutor encontrado</p>
            <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorSearchTab;
