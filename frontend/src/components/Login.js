import React from "react";
import { Button } from "./ui/button";
import axios from "axios";
import {
  Loader2,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showTermos, setShowTermos] = React.useState(false);
  const [showPrivacidade, setShowPrivacidade] = React.useState(false);
  const [contagem, setContagem] = React.useState({ totalTutores: 0, totalAlunos: 0 });

  React.useEffect(() => {
    axios
      .get("http://localhost:5001/users/contagem")
      .then((res) => setContagem(res.data))
      .catch(() => setContagem({ totalTutores: 0, totalAlunos: 0 }));
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:5001/auth/google";
  };

  const features = [
    { icon: BookOpen, text: "Seja tutor ou aluno" },
    { icon: Users, text: "Aprenda com seus colegas" },
    { icon: TrendingUp, text: "Evoluam juntos" },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tutor Connect
              </h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Aprenda ensinando
            </h2>
            <p className="text-lg text-gray-600">
              Conecte-se com colegas, compartilhe conhecimento e cresçam juntos
            </p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-1">
              <GraduationCap className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-violet-700">
                {contagem.totalTutores}
              </span>
              <span className="text-gray-600 text-xs">tutores</span>
            </div>
            <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-3 py-1">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-indigo-700">
                {contagem.totalAlunos}
              </span>
              <span className="text-gray-600 text-xs">alunos</span>
            </div>
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
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continuar com Google</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <p className="text-sm text-center text-gray-500">
              Ao continuar, você concorda com nossos{" "}
              <button
                type="button"
                className="text-gray-900 hover:underline font-medium"
                onClick={() => setShowTermos(true)}
              >
                Termos de Uso
              </button>{" "}
              e{" "}
              <button
                type="button"
                className="text-gray-900 hover:underline font-medium"
                onClick={() => setShowPrivacidade(true)}
              >
                Política de Privacidade
              </button>
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Aprendizagem colaborativa
            </p>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-700"
                >
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
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-12" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-3xl backdrop-blur-sm transform -rotate-12" />

        <div className="relative z-10 flex flex-col justify-center items-start p-16 text-white">
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Plataforma de tutoria colaborativa
              </span>
            </div>

            <h3 className="text-4xl font-bold leading-tight">
              Conecte-se, compartilhe e evolua junto com seus colegas
            </h3>

            <p className="text-xl text-violet-100">
              Encontre tutores que dominam o que você precisa aprender. Marque
              tutorias, compartilhe conhecimento e cresçam juntos.
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

      {/* Modal Termos de Uso */}
      <Dialog open={showTermos} onOpenChange={setShowTermos}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos de Uso — Tutor Connect</DialogTitle>
          </DialogHeader>
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <div className="text-gray-700 text-sm space-y-5">
              <div>
                <strong>Última atualização:</strong> 2025-06-01
              </div>
              <div>
                <h4 className="font-semibold mb-1">1. Aceitação dos Termos</h4>
                <p>
                  Ao acessar ou usar o Tutor Connect, você concorda com estes
                  Termos de Uso e com nossa Política de Privacidade. Se você não
                  concorda com estes termos, não utilize a plataforma.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">2. Descrição do Serviço</h4>
                <p>
                  Tutor Connect é uma plataforma colaborativa que conecta
                  estudantes para sessões de tutoria online. O serviço é
                  gratuito e destinado exclusivamente para fins educacionais.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">3. Cadastro e Conta</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Você deve fornecer informações verdadeiras e atualizadas ao
                    se cadastrar.
                  </li>
                  <li>
                    O acesso à plataforma é realizado via autenticação Google
                    OAuth.
                  </li>
                  <li>
                    Você é responsável por manter a confidencialidade de suas
                    credenciais.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">4. Uso da Plataforma</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Não é permitido utilizar a plataforma para fins ilícitos,
                    comerciais ou que violem direitos de terceiros.
                  </li>
                  <li>
                    É proibido publicar conteúdo ofensivo, discriminatório,
                    falso ou que infrinja leis.
                  </li>
                  <li>
                    O Tutor Connect pode suspender ou excluir contas que violem
                    estes termos.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">5. Privacidade</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Suas informações pessoais são tratadas conforme nossa
                    Política de Privacidade.
                  </li>
                  <li>
                    Dados de perfil, sessões e avaliações podem ser exibidos
                    para outros usuários da plataforma.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">6. Conteúdo do Usuário</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Você é responsável pelo conteúdo que publica (bio,
                    avaliações, comentários).
                  </li>
                  <li>
                    O Tutor Connect reserva-se o direito de remover conteúdo
                    inadequado sem aviso prévio.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  7. Limitação de Responsabilidade
                </h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    O Tutor Connect não se responsabiliza por eventuais danos,
                    perdas ou prejuízos decorrentes do uso da plataforma.
                  </li>
                  <li>
                    O serviço é fornecido "como está", sem garantias de
                    disponibilidade, precisão ou adequação para um fim
                    específico.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  8. Modificações nos Termos
                </h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Estes termos podem ser atualizados a qualquer momento.
                    Recomendamos que você os revise periodicamente.
                  </li>
                  <li>
                    O uso contínuo da plataforma após alterações implica
                    aceitação dos novos termos.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  9. Propriedade Intelectual
                </h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Todo o conteúdo, marca, código-fonte e funcionalidades do
                    Tutor Connect são protegidos por direitos autorais.
                  </li>
                  <li>
                    É proibida a reprodução, distribuição ou modificação sem
                    autorização prévia.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">10. Contato</h4>
                <p>
                  Dúvidas ou sugestões? Entre em contato pelo e-mail:{" "}
                  <a href="mailto:amorimm.dev@gmail.com" className="underline">
                    amorimm.dev@gmail.com
                  </a>
                </p>
              </div>
              <hr />
              <div>
                <p>
                  Ao utilizar o Tutor Connect, você declara estar de acordo com
                  todos os termos acima.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTermos(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Política de Privacidade */}
      <Dialog open={showPrivacidade} onOpenChange={setShowPrivacidade}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Política de Privacidade — Tutor Connect</DialogTitle>
          </DialogHeader>
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <div className="text-gray-700 text-sm space-y-5">
              <div>
                <strong>Última atualização:</strong> 2025-06-01
              </div>
              <div>
                <h4 className="font-semibold mb-1">1. Introdução</h4>
                <p>
                  Esta Política de Privacidade explica como o Tutor Connect
                  coleta, utiliza, armazena e protege suas informações pessoais
                  ao utilizar a plataforma.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">2. Informações Coletadas</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <strong>Dados de autenticação:</strong> Nome, e-mail e
                    identificador do Google, coletados via login OAuth.
                  </li>
                  <li>
                    <strong>Dados de perfil:</strong> Informações fornecidas
                    voluntariamente, como bio, localização, disciplinas,
                    disponibilidade.
                  </li>
                  <li>
                    <strong>Dados de uso:</strong> Informações sobre sessões
                    agendadas, avaliações, comentários e interações na
                    plataforma.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">3. Uso das Informações</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Permitir o funcionamento da plataforma e suas
                    funcionalidades.
                  </li>
                  <li>Facilitar a conexão entre alunos e tutores.</li>
                  <li>Gerenciar sessões, avaliações e notificações.</li>
                  <li>
                    Melhorar a experiência do usuário e a segurança do sistema.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  4. Compartilhamento de Dados
                </h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Dados de perfil, sessões e avaliações podem ser exibidos
                    para outros usuários da plataforma.
                  </li>
                  <li>
                    Não compartilhamos suas informações pessoais com terceiros,
                    exceto quando exigido por lei ou para funcionamento do
                    serviço (ex: integração Google Calendar).
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">5. Segurança</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Adotamos medidas técnicas e organizacionais para proteger
                    seus dados contra acesso não autorizado, alteração,
                    divulgação ou destruição.
                  </li>
                  <li>
                    O acesso à plataforma é protegido por autenticação segura
                    via Google OAuth.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">6. Retenção de Dados</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Seus dados são mantidos enquanto sua conta estiver ativa ou
                    conforme necessário para cumprir obrigações legais.
                  </li>
                  <li>
                    Você pode solicitar a exclusão de sua conta e dados a
                    qualquer momento.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">7. Direitos do Usuário</h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Solicitar acesso, correção ou exclusão de seus dados
                    pessoais.
                  </li>
                  <li>
                    Solicitar informações sobre o tratamento de seus dados.
                  </li>
                  <li>
                    Revogar o consentimento para uso de dados, quando aplicável.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  8. Cookies e Tecnologias Semelhantes
                </h4>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Utilizamos cookies apenas para autenticação e funcionamento
                    básico da plataforma.
                  </li>
                  <li>
                    Não utilizamos cookies para rastreamento de terceiros ou
                    publicidade.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">
                  9. Alterações na Política
                </h4>
                <p>
                  Esta política pode ser atualizada periodicamente. Recomendamos
                  que você a revise regularmente.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">10. Contato</h4>
                <p>
                  Dúvidas ou solicitações sobre privacidade? Entre em contato
                  pelo e-mail:{" "}
                  <a href="mailto:amorimm.dev@gmail.com" className="underline">
                    amorimm.dev@gmail.com
                  </a>
                </p>
              </div>
              <hr />
              <div>
                <p>
                  Ao utilizar o Tutor Connect, você concorda com esta Política
                  de Privacidade.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacidade(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Login;
