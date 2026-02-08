import React from "react";
import { render, screen } from "@testing-library/react";

const mockAuthValue = {
  token: null,
  user: null,
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

jest.mock("./contexts/AuthContext", () => {
  const React = require("react");
  const AuthContext = React.createContext(null);

  return {
    __esModule: true,
    default: AuthContext,
    AuthProvider: ({ children }) => {
      return (
        <AuthContext.Provider value={mockAuthValue}>
          {children}
        </AuthContext.Provider>
      );
    },
    useAuth: () => mockAuthValue,
  };
});

// Mock child components to isolate App routing logic
jest.mock("./components/Login", () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock("./components/Dashboard", () => {
  return function MockDashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock("./components/ProfileSetup", () => {
  return function MockProfileSetup() {
    return <div data-testid="profile-setup-page">Profile Setup Page</div>;
  };
});

jest.mock("./components/Profile", () => {
  return function MockProfile() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock("./components/Notifications", () => {
  return function MockNotifications() {
    return <div data-testid="notifications">Notifications</div>;
  };
});

jest.mock("./components/ErrorBoundary", () => {
  return function MockErrorBoundary({ children }) {
    return <>{children}</>;
  };
});

// Mock sonner
jest.mock("sonner", () => ({
  Toaster: () => null,
}));

// We import App after all mocks are set up
// But since App uses its own Router, we need to test the internal AppRoutes
// App wraps everything in BrowserRouter, so we test via App directly
// However, App includes its own Router so we cannot wrap in MemoryRouter.
// Instead, we rely on BrowserRouter and window.location.

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthValue.token = null;
    mockAuthValue.user = null;
    mockAuthValue.loading = false;
  });

  it("renders Login page when there is no token", () => {
    mockAuthValue.token = null;
    mockAuthValue.user = null;
    mockAuthValue.loading = false;

    render(<App />);

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("shows loading state when loading is true", () => {
    mockAuthValue.token = "some-token";
    mockAuthValue.user = null;
    mockAuthValue.loading = true;

    render(<App />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });
});
