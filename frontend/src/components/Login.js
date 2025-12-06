import React from 'react';
import { Button } from './ui/button';
import { Loader2, ArrowRight, Sparkles, BookOpen, Users, TrendingUp } from 'lucide-react';

function Login() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = 'http://localhost:5001/auth/google';
  };

  const features = [
    { icon: BookOpen, text: 'Seja tutor ou aluno' },
    { icon: Users, text: 'Aprenda com seus colegas' },
    { icon: TrendingUp, text: 'Evoluam juntos' }
  ];

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Tutor Connect</h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Aprenda ensinando
            </h2>
            <p className="text-lg text-gray-600">
              Conecte-se com colegas, compartilhe conhecimento e cresçam juntos
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continuar com Google</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <p className="text-sm text-center text-gray-500">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-gray-900 hover:underline font-medium">Termos de Uso</a>
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Aprendizagem colaborativa
            </p>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 via-violet-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-12" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-3xl backdrop-blur-sm transform -rotate-12" />
        
        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Plataforma de tutoria colaborativa</span>
            </div>
            
            <h3 className="text-4xl font-bold leading-tight">
              Conecte-se, compartilhe e evolua junto com seus colegas
            </h3>
            
            <p className="text-xl text-violet-100">
              Encontre tutores que dominam o que você precisa aprender. Marque tutorias, compartilhe conhecimento e cresçam juntos.
            </p>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-violet-200 text-sm">Gratuito</div>
              </div>
              <div>
                <div className="text-3xl font-bold">P2P</div>
                <div className="text-violet-200 text-sm">Entre alunos</div>
              </div>
              <div>
                <div className="text-3xl font-bold">Meet</div>
                <div className="text-violet-200 text-sm">Integrado</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-400/30 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export default Login;
