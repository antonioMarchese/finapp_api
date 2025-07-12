export default function slugfy(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}
