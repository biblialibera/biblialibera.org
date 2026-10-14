import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface PrivacyProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function Privacy({ theme, onToggleTheme }: PrivacyProps) {
  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <main>
        <Section bordered={false}>
          <article className="mx-auto max-w-[var(--reading-measure)] space-y-[var(--space-8)] text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            <header className="space-y-[var(--space-4)]">
              <h1 className="m-0 font-serif text-[length:var(--text-3xl)] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-text)]">
                Política de privacidade
              </h1>
              <p className="m-0 font-sans text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
                Atualizada em <time dateTime="2026-10-13">13 de outubro de 2026</time>.
              </p>
              <p>
                Esta política abrange o site biblialibera.org e os apps Biblia Libera para iPhone, iPad e Mac.
                Não há cadastro no projeto, anúncios ou rastreamento publicitário. A leitura não exige informar
                nome, e-mail ou telefone ao projeto.
              </p>
            </header>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Site e armazenamento no navegador
              </h2>
              <p>
                O site guarda no seu navegador a edição escolhida, católica ou protestante, e a opção de exibir
                a tradução ou o texto original. Essas preferências usam o armazenamento local do navegador
                (localStorage), não uma conta.
              </p>
              <p>
                A edição, o capítulo, o tema e os versículos de um link podem fazer parte da URL. A hospedagem
                recebe a URL solicitada, e os serviços nos quais você compartilha um link também podem recebê-la.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Apps e widgets
              </h2>
              <p>
                O texto bíblico, os temas e as fontes já vêm nos apps. A leitura, a busca e os widgets funcionam
                sem internet. Favoritos, progresso e preferências de leitura ficam em arquivos locais no seu
                dispositivo, compartilhados com os widgets.
              </p>
              <p>
                Os apps não incluem ferramentas de análise de uso ou telemetria e não enviam esses dados de
                leitura a servidores do projeto.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Sincronização opcional com o iCloud
              </h2>
              <p>
                A sincronização fica desativada por padrão. Se você ativar “Sincronizar com o iCloud” nos
                ajustes do app, favoritos, preferências e progresso serão enviados ao seu iCloud pessoal para
                sincronização entre dispositivos com a mesma conta Apple. O projeto não recebe esse conteúdo
                nem as credenciais da sua conta.
              </p>
              <p>
                A Apple processa essa sincronização conforme sua{' '}
                <a href="https://www.apple.com/legal/privacy/">política de privacidade</a>.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Hospedagem, fontes e serviços externos
              </h2>
              <p>
                O site é hospedado na Vercel e carrega fontes do Google Fonts. Ao acessar as páginas, seu
                navegador faz requisições a esses provedores. Essas requisições incluem informações técnicas,
                como endereço IP e dados do navegador, e podem gerar registros operacionais para entrega,
                segurança e funcionamento dos serviços.
              </p>
              <p>
                Consulte a <a href="https://vercel.com/legal/privacy-notice">política de privacidade da Vercel</a>
                {' '}e a <a href="https://policies.google.com/privacy?hl=pt-BR">política de privacidade do Google</a>
                {' '}para conhecer o tratamento desses dados. As fontes dos apps são incluídas no dispositivo
                e não são baixadas do Google durante a leitura.
              </p>
              <p>
                Abrir um link externo ou compartilhar uma passagem leva você ao serviço escolhido, como um
                navegador, mensageiro ou GitHub. Esse serviço tem sua própria política de privacidade. O
                compartilhamento ocorre quando você inicia essa ação.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Retenção e exclusão
              </h2>
              <p>
                As preferências do site permanecem no navegador até você limpar os dados do site. Nos apps,
                você pode remover favoritos e desfazer a marcação de capítulos lidos pelos controles de leitura.
              </p>
              <p>
                No iPhone e no iPad, apagar o app remove seus dados locais; esses arquivos são excluídos do
                backup do iCloud. No Mac, remover o app pode manter seu contêiner de dados local.
              </p>
              <p>
                Desativar a sincronização interrompe o envio ao iCloud, mas não apaga automaticamente os dados
                já enviados. O armazenamento no iCloud e os registros dos provedores de hospedagem e fontes
                seguem as regras e os prazos desses serviços.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Seus direitos e contato
              </h2>
              <p>
                Para dúvidas sobre esta política ou solicitações de acesso, correção ou exclusão de informações
                que você tenha enviado ao projeto, entre em contato com os mantenedores pelo{' '}
                <a href="https://github.com/biblialibera/biblialibera.org/issues">repositório do site</a> ou pelo{' '}
                <a href="https://github.com/biblialibera/ios/issues">repositório dos apps</a>. Esses canais são
                públicos; não inclua dados pessoais ou arquivos de leitura em uma solicitação pública.
              </p>
              <p>
                O projeto não tem acesso aos dados de leitura que permanecem no seu dispositivo ou no seu
                iCloud. Para gerenciá-los, use os controles do app, do navegador ou da sua conta Apple.
              </p>
            </section>

            <section className="space-y-[var(--space-4)]">
              <h2 className="font-serif text-[length:var(--text-xl)] font-semibold text-[var(--color-text)]">
                Alterações desta política
              </h2>
              <p>
                Se o funcionamento do site ou dos apps mudar, atualizaremos esta página e a data indicada no
                início da política.
              </p>
            </section>
          </article>
        </Section>
      </main>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default Privacy
