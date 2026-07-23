const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

function Landing() {
  return (
    <main className="landing">
      <header className="hero">
        <p className="eyebrow">Tradução aberta da Bíblia</p>
        <h1>Biblia Libera</h1>
        <p className="lead">
          Uma tradução aberta e transparente das Escrituras, direto do hebraico e do
          grego para o português contemporâneo, feita com apoio de modelos de
          linguagem e um processo verificável por qualquer pessoa.
        </p>
        <div className="actions">
          <a className="button primary" href="#em-breve">
            Ler a Bíblia
          </a>
          <a className="button" href={GITHUB_URL} target="_blank" rel="noreferrer">
            Ver o repositório
          </a>
        </div>
      </header>

      <section className="section">
        <h2>Duas formas de ler, o mesmo texto original</h2>
        <div className="registers">
          <div className="register-card">
            <h3>Formal</h3>
            <p>Português contemporâneo formal, equilibrando fidelidade à forma original com leitura fluida.</p>
          </div>
          <div className="register-card">
            <h3>Simples</h3>
            <p>Vocabulário acessível e frases curtas, priorizando a compreensão imediata.</p>
          </div>
          <div className="register-card">
            <h3>Original</h3>
            <p>O texto-fonte em hebraico (Westminster Leningrad Codex) ou grego (Nestle 1904), lado a lado com a tradução.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Por que</h2>
        <p>
          Tradução a partir dos textos originais, linguagem contemporânea, notas
          honestas onde o original é ambíguo e acesso livre para todos. Nada disso é
          novo: é o ponto comum de cinco séculos de tradução bíblica. O que muda aqui
          é o motor de tradução e a transparência do processo: cada versículo pode
          ser inspecionado, questionado e reproduzido por qualquer pessoa.
        </p>
      </section>

      <section id="em-breve" className="section">
        <h2>O leitor está em construção</h2>
        <p>
          Em breve, cada capítulo poderá ser lido nas três versões, com navegação
          entre elas. Acompanhe o progresso da tradução no{' '}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            repositório do projeto
          </a>
          .
        </p>
      </section>

      <footer className="footer">
        <p>
          Criado por{' '}
          <a href="https://github.com/merencia" target="_blank" rel="noreferrer">
            Lucas Merencia
          </a>
          . Textos e código sob CC BY 4.0.
        </p>
      </footer>
    </main>
  )
}

export default Landing
