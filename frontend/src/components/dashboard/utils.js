export const getInitials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateFull = (date) => {
  const dateStr =
    typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)
      ? date + "T12:00:00"
      : date;
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
};

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const getStatusColor = (s) =>
  ({
    Pendente: "bg-yellow-100 text-yellow-700",
    Confirmada: "bg-green-100 text-green-700",
    "Concluída": "bg-blue-100 text-blue-700",
    Cancelada: "bg-red-100 text-red-700",
  })[s] || "bg-gray-100";
