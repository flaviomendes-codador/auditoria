'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { saveUtmSource } from '@/lib/quiz-storage'
import './landing.css'

export default function LandingPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const utm = params.get('utm_source')
    if(utm) saveUtmSource(utm)
  }, [])

  return (
    <>
      <div className="tarja">
        Exclusivo para empresários que investem em anúncios
      </div>
      
      
      <div className="hero-wrap">
        <div className="hero-glow"></div>
        <div className="hero">
          <a href="#" className="hero-pill">
            <span className="pill-dot"></span>
            Diagnóstico gratuito · Resultado imediato
          </a>
      
          <h1 className="hero-h1">
            Aumente suas vendas<br/>
            <em>sem investir mais</em> em marketing,<br/>
            contratar mais pessoas<br/>
            ou gerar mais leads.
          </h1>
      
          <p className="hero-sub">
            A Auditoria QCR™ revela onde sua empresa está desperdiçando oportunidades e identifica os gargalos de Qualificação, Conexão e Recuperação que estão limitando seu crescimento.
          </p>
      
          <div className="hero-cta">
            <a href="#" className="btn-primary">Fazer Auditoria QCR™ ↗</a>
          </div>
          <p className="hero-micro">Diagnóstico gratuito &nbsp;·&nbsp; Resultado imediato &nbsp;·&nbsp; Menos de 3 minutos</p>
      
          
          <div className="hero-card">
            <div className="hc-winbar">
              <div className="hc-dot" style={{background:'oklch(52% .14 25)'}}></div>
              <div className="hc-dot" style={{background:'oklch(70% .12 70)'}}></div>
              <div className="hc-dot" style={{background:'oklch(70% .10 145)'}}></div>
            </div>
            <div className="hc-header">
              <span className="hc-header-label">Exemplo de Diagnóstico QCR™</span>
              <span className="hc-badge">⚠ Atenção</span>
            </div>
            <div className="hc-intro">
              <p>A maioria das empresas acredita que precisa de mais marketing. Na prática, elas já possuem oportunidades suficientes. O problema está na forma como qualificam, conectam e recuperam essas oportunidades.</p>
            </div>
            <div className="hc-body">
              <div className="hc-score-row">
                <span className="hc-number">47</span>
                <div className="hc-meta">
                  <span className="hc-level">Score Geral QCR™</span>
                  <span className="hc-desc">Calculado com base em 12 respostas</span>
                </div>
              </div>
              <div className="hc-bars">
                <div className="hc-bar-row">
                  <span className="hc-bl">Q</span>
                  <div className="hc-track"><div className="hc-fill" style={{width:'75%'}}></div></div>
                  <span className="hc-bv">75</span>
                </div>
                <div className="hc-bar-row">
                  <span className="hc-bl">C</span>
                  <div className="hc-track"><div className="hc-fill" style={{width:'45%'}}></div></div>
                  <span className="hc-bv">45</span>
                </div>
                <div className="hc-bar-row">
                  <span className="hc-bl">R</span>
                  <div className="hc-track"><div className="hc-fill warn" style={{width:'20%'}}></div></div>
                  <span className="hc-bv">20</span>
                </div>
              </div>
              <div className="hc-insight">
                <div className="hc-insight-icon">!</div>
                <p className="hc-insight-text">
                  <strong>Gargalo identificado em Recuperação.</strong> Sua empresa possui oportunidades que demonstraram interesse, mas não recebem acompanhamento suficiente. Existe receita parada na sua operação neste momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      <div className="cred">
        <div className="cred-item">
          <span className="cred-n">+327</span>
          <span className="cred-l">Empresas diagnosticadas</span>
        </div>
        <div className="cred-sep"></div>
        <div className="cred-item">
          <span className="cred-n">R$ 5.8M</span>
          <span className="cred-l">Em oportunidades identificadas</span>
        </div>
        <div className="cred-sep"></div>
        <div className="cred-item">
          <span className="cred-n">18</span>
          <span className="cred-l">Mercados analisados</span>
        </div>
        <div className="cred-sep"></div>
        <div className="cred-item">
          <span className="cred-n">3 min</span>
          <span className="cred-l">Para descobrir seu gargalo principal</span>
        </div>
      </div>
      
      
      <section className="sec-problema">
        <div className="sec-inner">
          <p className="s-eyebrow">O Diagnóstico</p>
          <h2 className="s-h2">Você não tem um problema de geração de demanda.<br/><em>Você tem um problema de desperdício.</em></h2>
          <p className="s-sub">Todos os dias empresas investem em marketing, recebem novos leads e continuam perdendo vendas. Não porque falta demanda. Mas porque existem gargalos invisíveis dentro da operação comercial.</p>
          <div className="problem-cards">
            <div className="problem-card">
              <div className="pc-letter">Q — Qualificar</div>
              <div className="pc-name">Identificação de oportunidades</div>
              <p className="pc-q1">Sua equipe sabe exatamente quais oportunidades possuem maior potencial de compra?</p>
              <p className="pc-q2">Ou todos os leads recebem a mesma atenção?</p>
            </div>
            <div className="problem-card">
              <div className="pc-letter">C — Conectar</div>
              <div className="pc-name">Velocidade e condução</div>
              <p className="pc-q1">Sua empresa responde rápido, gera confiança e conduz a conversa até o próximo passo?</p>
              <p className="pc-q2">Ou o lead recebe uma resposta genérica e desaparece?</p>
            </div>
            <div className="problem-card">
              <div className="pc-letter">R — Recuperar</div>
              <div className="pc-name">Processo de acompanhamento</div>
              <p className="pc-q1">Sua empresa possui um processo para recuperar oportunidades esquecidas?</p>
              <p className="pc-q2">Ou simplesmente aceita perder vendas todos os meses?</p>
            </div>
          </div>
          <p className="problem-close">Toda empresa que perde vendas está falhando em pelo menos uma etapa do <strong>Sistema QCR™</strong>.</p>
        </div>
      </section>
      
      
      <section className="sec-revela">
        <div className="sec-inner">
          <p className="s-eyebrow">O que você receberá</p>
          <h2 className="s-h2">Enquanto a maioria dos empresários trabalha no escuro, você descobrirá exatamente <em>onde sua empresa está perdendo dinheiro.</em></h2>
          <p className="s-sub">Em poucos minutos você receberá um diagnóstico baseado no Sistema QCR™.</p>
          <div className="revela-grid">
            <ul className="revela-list">
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Seu Score Geral QCR™
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Sua nota em Qualificação
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Sua nota em Conexão
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Sua nota em Recuperação
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Seu principal gargalo operacional
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Onde existem oportunidades desperdiçadas
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                O potencial de recuperação da sua operação
              </li>
              <li>
                <span className="revela-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>
                Qual etapa está travando seu crescimento
              </li>
            </ul>
            <div className="revela-box">
              <div className="rb-label">Observação importante</div>
              <p className="rb-lead">A maioria dos empresários não consegue enxergar seus gargalos.</p>
              <p className="rb-note">Eles apenas percebem os sintomas:</p>
              <div className="rb-symptoms">
                <span className="rb-symptom">Menos vendas.</span>
                <span className="rb-symptom">Menos conversões.</span>
                <span className="rb-symptom">Menos crescimento.</span>
              </div>
              <p className="rb-reveal">A Auditoria QCR™ mostra a causa.</p>
            </div>
          </div>
        </div>
      </section>
      
      
      <section className="sec-dark">
        <div className="sec-inner">
          <p className="s-eyebrow">Como funciona</p>
          <h2 className="s-h2">Três etapas. <em>Um diagnóstico preciso.</em></h2>
          <p className="s-sub">Sem cadastro, sem enrolação. Responda, receba o resultado, entenda o gargalo.</p>
          <div className="steps">
            <div>
              <div className="step-num">01</div>
              <h3 className="step-title">Responda 12 perguntas</h3>
              <p className="step-desc">Perguntas diretas sobre qualificação, velocidade de atendimento e processos de recuperação. Menos de 3 minutos.</p>
            </div>
            <div>
              <div className="step-num">02</div>
              <h3 className="step-title">Receba seu Score QCR™</h3>
              <p className="step-desc">Score individualizado para cada dimensão. O sistema identifica com precisão onde estão seus maiores gargalos.</p>
            </div>
            <div>
              <div className="step-num">03</div>
              <h3 className="step-title">Descubra o próximo passo</h3>
              <p className="step-desc">Diagnóstico com potencial de recuperação estimado. O próximo passo é uma conversa estratégica com Flávio.</p>
            </div>
          </div>
        </div>
      </section>
      
      
      <section className="sec-cta">
        <div className="cta-inner">
          <p className="s-eyebrow">Auditoria Gratuita</p>
          <h2 className="cta-h">
            Existe uma grande chance da sua empresa estar <em>perdendo vendas</em> sem perceber.
          </h2>
          <p className="cta-sub">A pergunta não é se existem gargalos. A pergunta é quanto eles estão custando para sua operação todos os meses.</p>
          <p className="cta-body">Empresas não perdem vendas por falta de marketing. Elas perdem porque falham em Qualificar, Conectar ou Recuperar oportunidades. É exatamente isso que a Auditoria QCR™ foi criada para revelar.</p>
          <div className="cta-actions">
            <a href="#" className="btn-primary">Descobrir meu Score QCR™ ↗</a>
          </div>
          <p className="cta-note">Se sua empresa recebe leads diariamente, é extremamente improvável que sua operação esteja otimizada nas três etapas do Sistema QCR™. Descubra agora onde está o seu maior gargalo.</p>
        </div>
      </section>
      
      
      <footer>
        <span className="ft">© 2026 Flávio Mendes. Sistema QCR™ é uma metodologia proprietária.</span>
        <div className="ft-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos</a>
        </div>
      </footer>
    </>
  )
}