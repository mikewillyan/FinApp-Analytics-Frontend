import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PoliticaDePrivacidade = ({ onBack }) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* Introdução */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta Política de Privacidade descreve como o FinApp Analytics coleta, usa, armazena e protege 
              suas informações pessoais quando você utiliza nossa plataforma de análise financeira.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política. 
              Sua privacidade é fundamental para nós e estamos comprometidos em proteger seus dados financeiros.
            </p>
          </section>

          {/* Informações que Coletamos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Informações de Autenticação</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Quando você faz login através do Google OAuth, coletamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Nome completo</li>
              <li>Endereço de email</li>
              <li>Foto de perfil (opcional)</li>
              <li>ID único do Google</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Dados Financeiros</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para fornecer nossos serviços, coletamos e armazenamos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Transações financeiras (receitas e despesas)</li>
              <li>Categorias personalizadas criadas por você</li>
              <li>Valores monetários e datas das transações</li>
              <li>Descrições e observações das transações</li>
              <li>Preferências de configuração da conta</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Dados Técnicos</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coletamos automaticamente:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Endereço IP</li>
              <li>Tipo de navegador e versão</li>
              <li>Sistema operacional</li>
              <li>Data e hora de acesso</li>
              <li>Páginas visitadas e tempo de permanência</li>
            </ul>
          </section>

          {/* Como Usamos suas Informações */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos suas Informações</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Fornecer serviços:</strong> Processar e exibir seus dados financeiros</li>
              <li><strong>Autenticação:</strong> Verificar sua identidade e manter sua conta segura</li>
              <li><strong>Melhorar a plataforma:</strong> Analisar o uso para melhorar funcionalidades</li>
              <li><strong>Suporte ao cliente:</strong> Responder a suas solicitações e dúvidas</li>
              <li><strong>Segurança:</strong> Detectar e prevenir fraudes ou uso indevido</li>
              <li><strong>Cumprimento legal:</strong> Atender obrigações legais quando necessário</li>
            </ul>
          </section>

          {/* Compartilhamento de Informações */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros</strong>, 
              exceto nas seguintes circunstâncias:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Com seu consentimento:</strong> Quando você autoriza explicitamente</li>
              <li><strong>Prestadores de serviços:</strong> Empresas que nos ajudam a operar a plataforma (hospedagem, análise)</li>
              <li><strong>Cumprimento legal:</strong> Quando exigido por lei ou ordem judicial</li>
              <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos ou segurança dos usuários</li>
              <li><strong>Transferência de negócio:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
            </ul>
          </section>

          {/* Segurança dos Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Segurança dos Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Criptografia:</strong> Dados criptografados em trânsito e em repouso</li>
              <li><strong>Autenticação segura:</strong> OAuth 2.0 com Google para login</li>
              <li><strong>Acesso restrito:</strong> Apenas pessoal autorizado tem acesso aos dados</li>
              <li><strong>Monitoramento:</strong> Sistemas de monitoramento de segurança 24/7</li>
              <li><strong>Backup seguro:</strong> Cópias de segurança criptografadas</li>
              <li><strong>Atualizações regulares:</strong> Manutenção e atualizações de segurança</li>
            </ul>
          </section>

          {/* Retenção de Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantemos suas informações pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Fornecer nossos serviços enquanto sua conta estiver ativa</li>
              <li>Cumprir obrigações legais e regulamentares</li>
              <li>Resolver disputas e fazer cumprir nossos acordos</li>
              <li>Manter registros de segurança e auditoria</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Quando você exclui sua conta, seus dados pessoais são removidos dentro de 30 dias, 
              exceto quando a retenção for necessária por motivos legais.
            </p>
          </section>

          {/* Seus Direitos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Seus Direitos</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
              <li><strong>Retificação:</strong> Corrigir informações incorretas ou incompletas</li>
              <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              <li><strong>Restrição:</strong> Limitar como processamos seus dados</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para exercer esses direitos, entre em contato conosco através dos canais indicados na seção de contato.
            </p>
          </section>

          {/* Cookies e Tecnologias Similares */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies e tecnologias similares para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Manter sua sessão ativa</li>
              <li>Lembrar suas preferências</li>
              <li>Melhorar a experiência do usuário</li>
              <li>Analisar o uso da plataforma</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Você pode controlar cookies através das configurações do seu navegador, 
              mas isso pode afetar a funcionalidade da plataforma.
            </p>
          </section>

          {/* Transferência Internacional */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferência Internacional</h2>
            <p className="text-gray-700 leading-relaxed">
              Seus dados podem ser processados e armazenados em servidores localizados fora do Brasil. 
              Quando isso ocorrer, garantimos que:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
              <li>O país de destino oferece proteção adequada aos dados pessoais</li>
              <li>Implementamos salvaguardas apropriadas para proteger seus dados</li>
              <li>Obtemos seu consentimento quando necessário</li>
            </ul>
          </section>

          {/* Menores de Idade */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
            <p className="text-gray-700 leading-relaxed">
              Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente 
              informações pessoais de menores. Se descobrirmos que coletamos dados de um menor, 
              tomaremos medidas para excluir essas informações.
            </p>
          </section>

          {/* Alterações na Política */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos alterações significativas, 
              notificaremos você através da plataforma ou por email.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Recomendamos que você revise esta política regularmente para se manter informado sobre 
              como protegemos suas informações.
            </p>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, 
              entre em contato conosco:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Email: privacidade@finappanalytics.online</li>
              <li>Website: https://finappanalytics.online</li>
              <li>Para exercer seus direitos: direitos@finappanalytics.online</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PoliticaDePrivacidade;
