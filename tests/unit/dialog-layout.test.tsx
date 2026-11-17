import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Regressão de 17/11/2026: os diálogos são grades (`grid`) e a coluna implícita crescia
 * até o conteúdo que não quebra linha (título de estudo + selo), passando da largura da
 * tela no celular. A coluna precisa ser `minmax(0, 1fr)` para ficar presa ao diálogo.
 */
describe('Diálogos não passam da largura da tela', () => {
  it('Dialog prende a coluna da grade à largura do diálogo', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Provérbios 2</DialogTitle>
          <DialogDescription>Descrição</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toContain('grid-cols-[minmax(0,1fr)]');
    expect(dialog!.className).toContain('w-[calc(100%-2rem)]');
  });

  it('AlertDialog prende a coluna da grade à largura do diálogo', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Apagar?</AlertDialogTitle>
          <AlertDialogDescription>Descrição</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    const dialog = document.querySelector('[role="alertdialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toContain('grid-cols-[minmax(0,1fr)]');
    expect(dialog!.className).toContain('w-[calc(100%-2rem)]');
  });
});
