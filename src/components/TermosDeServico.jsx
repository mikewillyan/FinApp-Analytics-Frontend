import React from 'react';
import { ArrowLeft } from 'lucide-react';

const TermosDeServico = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
          <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Introdução */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 leading-relaxed">
              Bem-vindo ao FinApp Analytics! Estes Termos de Serviço ("Termos") regem o uso da nossa plataforma 
              de análise financeira pessoal. Ao utilizar nossos serviços, você concorda em cumprir estes termos.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              O FinApp Analytics é uma aplicação web que permite aos usuários gerenciar suas finanças pessoais, 
              categorizar receitas e despesas, e visualizar análises financeiras através de gráficos e relatórios.
            </p>
          </section>

          {/* Aceitação dos Termos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Aceitação dos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Ao criar uma conta ou utilizar nossos serviços, você confirma que:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>Você tem pelo menos 18 anos de idade ou possui autorização legal para concordar com estes termos</li>
              <li>Você leu, compreendeu e concorda em cumprir estes Termos de Serviço</li>
              <li>Você fornecerá informações verdadeiras e precisas ao criar sua conta</li>
              <li>Você é responsável por manter a segurança de sua conta e senha</li>
            </ul>
          </section>

          {/* Descrição dos Serviços */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Descrição dos Serviços</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O FinApp Analytics oferece os seguintes serviços:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Gestão Financeira:</strong> Registro e categorização de receitas e despesas</li>
              <li><strong>Análises e Relatórios:</strong> Visualização de dados financeiros através de gráficos e estatísticas</li>
              <li><strong>Categorização Personalizada:</strong> Criação e gerenciamento de categorias personalizadas</li>
              <li><strong>Histórico Financeiro:</strong> Acompanhamento de transações ao longo do tempo</li>
              <li><strong>Autenticação Segura:</strong> Login através de Google OAuth para maior segurança</li>
            </ul>
          </section>

          {/* Responsabilidades do Usuário */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsabilidades do Usuário</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Como usuário do FinApp Analytics, você se compromete a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Não utilizar o serviço para atividades ilegais ou não autorizadas</li>
              <li>Não tentar acessar contas de outros usuários</li>
              <li>Não interferir no funcionamento normal da plataforma</li>
              <li>Reportar qualquer uso indevido ou vulnerabilidade de segurança</li>
            </ul>
          </section>

          {/* Privacidade e Proteção de Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Privacidade e Proteção de Dados</h2>
            <p className="text-gray-700 leading-relaxed">
              Levamos a privacidade dos seus dados financeiros muito a sério. Todas as informações são:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>Criptografadas durante o armazenamento e transmissão</li>
              <li>Acessíveis apenas por você através de sua conta autenticada</li>
              <li>Nunca compartilhadas com terceiros sem seu consentimento explícito</li>
              <li>Protegidas por medidas de segurança técnicas e organizacionais</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para mais detalhes sobre como coletamos, usamos e protegemos seus dados, consulte nossa 
              <a href="/politica-de-privacidade" className="text-blue-600 hover:text-blue-800 underline"> Política de Privacidade</a>.
            </p>
          </section>

          {/* Limitações de Responsabilidade */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitações de Responsabilidade</h2>
            <p className="text-gray-700 leading-relaxed">
              O FinApp Analytics é fornecido "como está" e não garantimos que:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>O serviço estará sempre disponível ou livre de erros</li>
              <li>Os dados serão sempre precisos ou atualizados</li>
              <li>O serviço atenderá a todas as suas necessidades específicas</li>
              <li>Não haverá interrupções temporárias do serviço</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Em nenhuma circunstância seremos responsáveis por danos diretos, indiretos, incidentais ou consequenciais 
              resultantes do uso ou incapacidade de usar nossos serviços.
            </p>
          </section>

          {/* Modificações dos Termos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Modificações dos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. 
              As alterações entrarão em vigor imediatamente após a publicação na plataforma.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              É sua responsabilidade revisar periodicamente estes termos. O uso continuado dos serviços 
              após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* Encerramento da Conta */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Encerramento da Conta</h2>
            <p className="text-gray-700 leading-relaxed">
              Você pode encerrar sua conta a qualquer momento através das configurações da plataforma. 
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Após o encerramento, seus dados serão excluídos de acordo com nossa Política de Privacidade, 
              respeitando os prazos legais de retenção quando aplicável.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contato</h2>
            <p className="text-gray-700 leading-relaxed">
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco através de:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>Email: contato@finappanalytics.online</li>
              <li>Website: https://finappanalytics.online</li>
            </ul>
          </section>

          {/* Lei Aplicável */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Lei Aplicável</h2>
            <p className="text-gray-700 leading-relaxed">
              Estes Termos de Serviço são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
              nos tribunais competentes do Brasil.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermosDeServico;
