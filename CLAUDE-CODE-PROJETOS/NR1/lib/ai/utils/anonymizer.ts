const CPF_REGEX = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g;
const RG_REGEX = /\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]/g;
const BIRTH_DATE_REGEX = /\b(\d{2})\/(\d{2})\/(\d{4})\b/g;

export function anonymize(text: string): string {
  return text
    .replace(CPF_REGEX, '[CPF]')
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(PHONE_REGEX, '[TELEFONE]')
    .replace(RG_REGEX, '[RG]')
    .replace(BIRTH_DATE_REGEX, 'XX/XX/$3');
}
