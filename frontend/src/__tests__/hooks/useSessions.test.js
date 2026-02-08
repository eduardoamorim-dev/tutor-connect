import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSessions } from "../../hooks/useSessions";

jest.mock("../../api/services/sessoesApi", () => ({
  __esModule: true,
  default: {
    getMinhasSessoes: jest.fn(),
    confirmar: jest.fn(),
    cancelar: jest.fn(),
    concluir: jest.fn(),
    avaliar: jest.fn(),
  },
}));

// Mock sonner toast to avoid errors
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import sessoesApi from "../../api/services/sessoesApi";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls getMinhasSessoes on render", async () => {
    const mockSessoes = [
      { _id: "s1", disciplina: "Matematica", status: "confirmada" },
      { _id: "s2", disciplina: "Fisica", status: "pendente" },
    ];

    sessoesApi.getMinhasSessoes.mockResolvedValue({ data: mockSessoes });

    const wrapper = createWrapper();
    renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(sessoesApi.getMinhasSessoes).toHaveBeenCalledTimes(1);
    });
  });

  it("exposes session data from query", async () => {
    const mockSessoes = [
      { _id: "s1", disciplina: "Matematica", status: "confirmada" },
      { _id: "s2", disciplina: "Fisica", status: "pendente" },
    ];

    sessoesApi.getMinhasSessoes.mockResolvedValue({ data: mockSessoes });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSessions(), { wrapper });

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessoes).toEqual(mockSessoes);
  });

  it("defaults sessoes to empty array when no data", async () => {
    sessoesApi.getMinhasSessoes.mockRejectedValue(new Error("Network error"));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessoes).toEqual([]);
  });

  it("exposes confirmar, cancelar, concluir, and avaliar functions", async () => {
    sessoesApi.getMinhasSessoes.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSessions(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.confirmar).toBe("function");
    expect(typeof result.current.cancelar).toBe("function");
    expect(typeof result.current.concluir).toBe("function");
    expect(typeof result.current.avaliar).toBe("function");
  });
});
