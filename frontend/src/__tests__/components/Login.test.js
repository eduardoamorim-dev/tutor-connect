import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../helpers/renderWithProviders";
import Login from "../../components/Login";

jest.mock("../../api/services/usersApi", () => ({
  __esModule: true,
  default: { getContagem: jest.fn() },
}));

jest.mock("../../api/services/authApi", () => ({
  __esModule: true,
  default: { getGoogleAuthUrl: jest.fn() },
}));

import usersApi from "../../api/services/usersApi";
import authApi from "../../api/services/authApi";

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usersApi.getContagem.mockResolvedValue({
      data: { totalTutores: 5, totalAlunos: 10 },
    });
    authApi.getGoogleAuthUrl.mockReturnValue("https://accounts.google.com/o/oauth2/auth");
  });

  it("renders 'Tutor Connect' heading", async () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Tutor Connect")).toBeInTheDocument();
  });

  it("renders 'Continuar com Google' button", async () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Continuar com Google")).toBeInTheDocument();
  });

  it("renders feature descriptions", async () => {
    renderWithProviders(<Login />);

    expect(screen.getByText("Seja tutor ou aluno")).toBeInTheDocument();
    expect(screen.getByText("Aprenda com seus colegas")).toBeInTheDocument();
    expect(screen.getByText("Evoluam juntos")).toBeInTheDocument();
  });

  it("calls getContagem on mount", async () => {
    renderWithProviders(<Login />);

    await waitFor(() => {
      expect(usersApi.getContagem).toHaveBeenCalledTimes(1);
    });
  });

  it("displays tutor and student counts after loading", async () => {
    renderWithProviders(<Login />);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });
});
