import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../helpers/renderWithProviders";
import RateModal from "../../components/dashboard/RateModal";

// Mock Radix Dialog to avoid JSDOM portal issues
jest.mock("../../components/ui/dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
  DialogFooter: ({ children }) => <div>{children}</div>,
}));

describe("RateModal", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render content when open is false", () => {
    renderWithProviders(<RateModal {...defaultProps} open={false} />);

    expect(screen.queryByText("Avaliar Sessao")).not.toBeInTheDocument();
  });

  it("renders 'Avaliar Sessao' title when open", () => {
    renderWithProviders(<RateModal {...defaultProps} />);

    expect(screen.getByText("Avaliar Sessao")).toBeInTheDocument();
  });

  it("renders 5 star rating buttons", () => {
    renderWithProviders(<RateModal {...defaultProps} />);

    const ratingContainer = screen.getByText("Nota").parentElement;
    const ratingButtons = ratingContainer.querySelectorAll("button");
    expect(ratingButtons).toHaveLength(5);
  });

  it("renders submit button with text 'Enviar'", () => {
    renderWithProviders(<RateModal {...defaultProps} />);

    expect(screen.getByText("Enviar")).toBeInTheDocument();
  });

  it("renders description text", () => {
    renderWithProviders(<RateModal {...defaultProps} />);

    expect(screen.getByText("Como foi sua experiencia?")).toBeInTheDocument();
  });

  it("calls onSubmit with nota and comentario when submit is clicked", async () => {
    renderWithProviders(<RateModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Enviar"));

    expect(defaultProps.onSubmit).toHaveBeenCalledWith(5, "");
  });
});
