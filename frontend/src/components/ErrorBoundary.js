import React from "react";
import { GraduationCap } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-violet-200">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Algo deu errado</h1>
              <p className="text-gray-500">
                Ocorreu um erro inesperado. Tente recarregar a página.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-violet-200 transition-all duration-200"
              >
                Recarregar
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                Ir para o início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
