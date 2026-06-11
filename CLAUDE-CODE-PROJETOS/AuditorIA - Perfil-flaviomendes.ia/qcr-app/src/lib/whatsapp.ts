import type { Bloco } from './questions'
const LABELS: Record<Bloco,string> = { Q:'Qualificação', C:'Conexão', R:'Recuperação' }
export function buildWhatsAppUrl(p:{nome:string;empresa:string;scoreTotal:number;gargalo:Bloco;whatsappNumber:string}): string {
  const msg=`Olá Flávio, fiz a Auditoria QCR™. Score: ${p.scoreTotal}. Gargalo principal: ${LABELS[p.gargalo]}. Empresa: ${p.empresa}. Quero entender como melhorar.`
  return `https://wa.me/${p.whatsappNumber}?text=${encodeURIComponent(msg)}`
}
