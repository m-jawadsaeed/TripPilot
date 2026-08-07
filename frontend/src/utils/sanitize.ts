import DOMPurify from 'dompurify';

export function sanitizeSvg(svgString: string): string {
  return DOMPurify.sanitize(svgString, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['style'],
    ADD_ATTR: ['class', 'id', 'role', 'aria-label'],
  });
}

export function sanitizeSvgWithVars(svgString: string): string {
  let cleaned = svgString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\bon\w+\s*=\s*[^\s>"']*/gi, '');

  cleaned = cleaned
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

  cleaned = cleaned
    .replace(/href\s*=\s*["']?\s*javascript\s*:/gi, 'href="#"')
    .replace(/src\s*=\s*["']?\s*javascript\s*:/gi, 'src="#"')
    .replace(/href\s*=\s*["']?\s*data\s*:(?!image)/gi, 'href="#"');

  return cleaned;
}
