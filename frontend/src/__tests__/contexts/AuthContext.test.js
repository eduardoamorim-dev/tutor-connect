import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

jest.mock("../../api/services/authApi", () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

jest.mock("../../api/services/usersApi", () => ({
  __esModule: true,
  default: { getProfile: jest.fn() },
}));

import authApi from "../../api/services/authApi";
import usersApi from "../../api/services/usersApi";

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it("useAuth throws error when used outside AuthProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("sets loading to false after verify completes", async () => {
    localStorage.setItem("token", "some-token");
    authApi.verify.mockResolvedValue({ data: { valid: false } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("login stores token in localStorage", async () => {
    authApi.verify.mockResolvedValue({ data: { valid: false } });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login("new-test-token");
    });

    expect(localStorage.getItem("token")).toBe("new-test-token");
    expect(result.current.token).toBe("new-test-token");
  });

  it("logout removes token and clears user", async () => {
    localStorage.setItem("token", "existing-token");

    authApi.verify.mockResolvedValue({
      data: { valid: true, user: { _id: "user1", nome: "Test" } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({ _id: "user1", nome: "Test" });

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("sets user when token is valid on mount", async () => {
    localStorage.setItem("token", "valid-token");

    const mockUser = { _id: "user1", nome: "Test User", email: "test@email.com" };

    authApi.verify.mockResolvedValue({
      data: { valid: true, user: mockUser },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe("valid-token");
  });

  it("clears token when verify fails", async () => {
    localStorage.setItem("token", "bad-token");

    authApi.verify.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("refreshUser fetches and updates user profile", async () => {
    localStorage.setItem("token", "valid-token");

    authApi.verify.mockResolvedValue({
      data: { valid: true, user: { _id: "user1", nome: "Old Name" } },
    });

    usersApi.getProfile.mockResolvedValue({
      data: { _id: "user1", nome: "Updated Name" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(usersApi.getProfile).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual({ _id: "user1", nome: "Updated Name" });
  });
});
