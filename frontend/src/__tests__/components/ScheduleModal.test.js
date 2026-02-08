import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../helpers/renderWithProviders";
import ScheduleModal from "../../components/dashboard/ScheduleModal";

// Mock Radix Dialog and Select to avoid JSDOM portal issues
jest.mock("../../components/ui/dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <div>{children}</div>,
  DialogFooter: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../components/ui/select", () => ({
  Select: ({ children, value }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }) => <button>{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
}));

describe("ScheduleModal", () => {
  const mockTutor = {
    _id: "tutor123",
    nome: "Maria Silva",
    rating: 4.5,
    disciplinas_dominadas: [
      { disciplina: "Matematica", nivel: "Avancado" },
      { disciplina: "Fisica", nivel: "Intermediario" },
    ],
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    tutor: mockTutor,
    disponibilidades: [],
    loadingDisponibilidade: false,
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render content when open is false", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} open={false} />);

    expect(screen.queryByText("Agendar Sessao")).not.toBeInTheDocument();
  });

  it("renders tutor info when open", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} />);

    expect(screen.getByText("Agendar Sessao")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
  });

  it("shows 'Sem horarios disponiveis' when disponibilidades is empty", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} disponibilidades={[]} />);

    expect(screen.getByText("Sem horarios disponiveis")).toBeInTheDocument();
  });

  it("renders discipline label", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} />);

    expect(screen.getByText("Disciplina")).toBeInTheDocument();
  });

  it("renders discipline options from tutor's disciplinas", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} />);

    expect(screen.getByText("Matematica - Avancado")).toBeInTheDocument();
    expect(screen.getByText("Fisica - Intermediario")).toBeInTheDocument();
  });

  it("renders 'Confirmar' submit button", () => {
    renderWithProviders(<ScheduleModal {...defaultProps} />);

    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });
});
