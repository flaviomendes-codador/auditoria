import type { Bloco } from './questions'
export type Nivel = 'critico' | 'atencao' | 'bom' | 'excelente'

export function calcBlockScore(valores: number[]): number {
  if (!valores.length) return 0
  return Math.round(valores.reduce((s,v)=>s+v,0)/valores.length)
}
export function calcTotalScore(q:number,c:number,r:number): number { return Math.round((q+c+r)/3) }
export function getLevel(score:number): Nivel { return score<=39?'critico':score<=69?'atencao':score<=89?'bom':'excelente' }
export function getGargalo(q:number,c:number,r:number): Bloco { const m=Math.min(q,c,r); return q===m?'Q':c===m?'C':'R' }

const POTENCIAL: Record<Bloco, string[]> = {
  Q: [
    'Sem critério objetivo de qualificação, **40–60% do esforço comercial é desperdiçado** em leads que nunca vão comprar.',
    'Equipes com qualificação estruturada **convertem 2× mais com o mesmo volume de leads** — sem contratar ou anunciar mais.',
    'Redirecionar o tempo da equipe para oportunidades de alto potencial pode **dobrar a taxa de fechamento em 60–90 dias**.',
  ],
  C: [
    'Empresas que respondem em menos de 5 minutos convertem **9× mais do que as que demoram 30 minutos**.',
    'Um roteiro de primeiro contato padronizado aumenta a taxa de agendamento em **20–35% nos primeiros 30 dias**.',
    'Melhorar a condução do primeiro contato é a **alavanca de maior retorno imediato** em operações com score de Conexão abaixo de 50.',
  ],
  R: [
    'Leads que demonstraram interesse e não receberam follow-up têm **30–40% de chance de fechar** em contato posterior.',
    'Empresas com processo estruturado de Recuperação **aumentam a receita em 15–25% sem novos leads**.',
    'Com score de Recuperação abaixo de 40, a maioria das oportunidades paradas na sua operação **ainda são recuperáveis agora**.',
  ],
}

export function getPotencial(gargalo: Bloco): string[] { return POTENCIAL[gargalo] }

const DIAGNOSTIC: Record<Bloco, Record<Nivel, string>> = {
  Q: {
    critico:'Sua equipe trata todos os leads da mesma forma. Oportunidades de alto valor competem por atenção com contatos sem potencial — e ambos perdem.',
    atencao:'Sua qualificação é inconsistente. Alguns vendedores identificam boas oportunidades, outros não. O resultado é imprevisível e difícil de escalar.',
    bom:'Sua qualificação está no caminho certo. O próximo passo é tornar o processo sistemático para que todos os vendedores obtenham resultados similares.',
    excelente:'Qualificação sólida. Você sabe exatamente onde investir o tempo da equipe comercial.',
  },
  C: {
    critico:'Sua empresa está perdendo leads no momento mais crítico: o primeiro contato. Velocidade e condução insuficientes fazem o lead perder interesse antes de receber uma proposta.',
    atencao:'Sua capacidade de conexão varia conforme o vendedor. Leads que chegam a um profissional melhor convertem. Os demais, não. Isso é risco operacional.',
    bom:'Sua equipe conecta bem na maioria dos casos. Padronizar os critérios de próximo passo elevará sua conversão de forma consistente.',
    excelente:'Conexão eficiente. Você responde rápido, comunica valor e define próximos passos com clareza.',
  },
  R: {
    critico:'Existe receita parada na sua operação neste momento. Leads que demonstraram interesse e foram esquecidos. Sem processo de recuperação, você descarta oportunidades que já custaram dinheiro para atrair.',
    atencao:'Sua recuperação é parcial e depende de iniciativa individual. Quando alguém lembra, o follow-up acontece. Quando não lembra, o lead some. Receita que escapa pelo descuido operacional.',
    bom:'Você tem processo de recuperação, mas não é sistemático o suficiente. Automatizar a cadência multiplicará os resultados sem mais esforço da equipe.',
    excelente:'Recuperação bem estruturada. Você não deixa oportunidades morrerem por falta de acompanhamento.',
  },
}

export function getDiagnosticText(gargalo: Bloco, nivel: Nivel): string { return DIAGNOSTIC[gargalo][nivel] }
