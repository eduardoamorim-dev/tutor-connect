import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useNotifications } from "../../hooks/useNotifications";

jest.mock("../../api/services/notificacoesApi", () => ({
  __esModule: true,
  default: {
    count: jest.fn(),
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    deleteOne: jest.fn(),
    deleteAllRead: jest.fn(),
  },
}));

import notificacoesApi from "../../api/services/notificacoesApi";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        refetchInterval: false,
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

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches unread count on mount", async () => {
    notificacoesApi.count.mockResolvedValue({ data: { count: 3 } });
    notificacoesApi.list.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(notificacoesApi.count).toHaveBeenCalled();
    });
  });

  it("exposes unreadCount from query data", async () => {
    notificacoesApi.count.mockResolvedValue({ data: { count: 7 } });
    notificacoesApi.list.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => {
      expect(result.current.count).toBe(7);
    });
  });

  it("defaults count to 0 before data loads", () => {
    notificacoesApi.count.mockResolvedValue({ data: { count: 5 } });
    notificacoesApi.list.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    // Before data loads, count defaults to 0
    expect(result.current.count).toBe(0);
  });

  it("exposes markAsRead and markAllAsRead functions", async () => {
    notificacoesApi.count.mockResolvedValue({ data: { count: 0 } });
    notificacoesApi.list.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(typeof result.current.markAsRead).toBe("function");
    expect(typeof result.current.markAllAsRead).toBe("function");
  });

  it("exposes deleteNotification and clearRead functions", async () => {
    notificacoesApi.count.mockResolvedValue({ data: { count: 0 } });
    notificacoesApi.list.mockResolvedValue({ data: [] });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(typeof result.current.deleteNotification).toBe("function");
    expect(typeof result.current.clearRead).toBe("function");
  });
});
