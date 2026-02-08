import React from "react";
import AuthContext from "../../contexts/AuthContext";

const defaultAuthValue = {
  token: "mock-jwt-token",
  user: {
    _id: "user123",
    nome: "Teste User",
    email: "teste@email.com",
    isTutor: false,
    profileCompleted: true,
    bio: "",
    localizacao: "Sao Paulo",
    disciplinas_dominadas: [],
    disciplinas_precisa: [],
  },
  loading: false,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

export function MockAuthProvider({ children, value = {} }) {
  const mergedValue = { ...defaultAuthValue, ...value };
  return <AuthContext.Provider value={mergedValue}>{children}</AuthContext.Provider>;
}

export { defaultAuthValue };
