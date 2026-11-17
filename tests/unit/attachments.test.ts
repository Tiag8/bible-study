import { describe, it, expect } from 'vitest';
import {
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_BYTES,
  buildAttachmentPath,
  displayFileName,
  formatFileSize,
  isPreviewableImage,
  sanitizeFileName,
  validateAttachment,
} from '@/lib/attachments';

const USER = '11111111-1111-4111-8111-111111111111';
const STUDY = '22222222-2222-4222-8222-222222222222';

describe('Study attachments helpers', () => {
  describe('sanitizeFileName', () => {
    it('remove acentos e mantém a extensão', () => {
      expect(sanitizeFileName('Provérbios 1 — caderno de revisão.pdf')).toBe(
        'Proverbios-1-caderno-de-revisao.pdf'
      );
    });

    it('troca caracteres não aceitos pelo Storage por hífen', () => {
      expect(sanitizeFileName('foto (1) #final?.JPG')).toBe('foto-1-final-.JPG');
    });

    it('não devolve nome vazio nem iniciado por ponto', () => {
      expect(sanitizeFileName('???')).toBe('arquivo');
      expect(sanitizeFileName('..%2F..%2Fsegredo.pdf')).not.toMatch(/^\./);
    });

    it('não deixa barra passar (sem sair da pasta do estudo)', () => {
      expect(sanitizeFileName('../../outro-usuario/arquivo.pdf')).not.toContain('/');
    });
  });

  describe('buildAttachmentPath e displayFileName', () => {
    it('guarda o arquivo na pasta do usuário e do estudo', () => {
      const path = buildAttachmentPath(USER, STUDY, 'Anotação.png', 1763370000000);
      expect(path).toBe(`${USER}/${STUDY}/1763370000000-Anotacao.png`);
    });

    it('displayFileName tira só o prefixo de data', () => {
      expect(displayFileName('1763370000000-Anotacao.png')).toBe('Anotacao.png');
      expect(displayFileName('2026-relatorio.pdf')).toBe('2026-relatorio.pdf');
    });

    it('dois envios do mesmo arquivo não colidem', () => {
      const first = buildAttachmentPath(USER, STUDY, 'a.pdf', 1763370000000);
      const second = buildAttachmentPath(USER, STUDY, 'a.pdf', 1763370000001);
      expect(first).not.toBe(second);
    });
  });

  describe('validateAttachment', () => {
    it('aceita PDF e imagem dentro do limite', () => {
      expect(validateAttachment({ name: 'a.pdf', size: 150_000, type: 'application/pdf' })).toBeNull();
      expect(validateAttachment({ name: 'a.jpg', size: 3_000_000, type: 'image/jpeg' })).toBeNull();
    });

    it('recusa tipo fora da lista', () => {
      expect(validateAttachment({ name: 'a.svg', size: 10, type: 'image/svg+xml' })).toContain('não permitido');
      expect(validateAttachment({ name: 'a.exe', size: 10, type: 'application/x-msdownload' })).toContain(
        'não permitido'
      );
      expect(validateAttachment({ name: 'sem-tipo', size: 10, type: '' })).toContain('não permitido');
    });

    it('recusa arquivo acima do limite e arquivo vazio', () => {
      expect(
        validateAttachment({ name: 'a.pdf', size: MAX_ATTACHMENT_BYTES + 1, type: 'application/pdf' })
      ).toContain('passa de');
      expect(validateAttachment({ name: 'a.pdf', size: 0, type: 'application/pdf' })).toContain('vazio');
    });

    it('aceita exatamente o limite', () => {
      expect(
        validateAttachment({ name: 'a.pdf', size: MAX_ATTACHMENT_BYTES, type: 'application/pdf' })
      ).toBeNull();
    });
  });

  describe('formatFileSize e isPreviewableImage', () => {
    it('formata em B, KB e MB', () => {
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(151_813)).toBe('148 KB');
      expect(formatFileSize(3_670_016)).toBe('3,5 MB');
    });

    it('mostra miniatura só para imagens que o navegador renderiza', () => {
      expect(isPreviewableImage('image/png')).toBe(true);
      expect(isPreviewableImage('image/heic')).toBe(false);
      expect(isPreviewableImage('application/pdf')).toBe(false);
    });
  });

  it('a lista de tipos não inclui SVG nem HTML (executam script ao abrir)', () => {
    expect(ALLOWED_ATTACHMENT_TYPES).not.toContain('image/svg+xml');
    expect(ALLOWED_ATTACHMENT_TYPES).not.toContain('text/html');
  });
});
