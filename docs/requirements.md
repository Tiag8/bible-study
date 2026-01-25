# 📖 Bible Graph - Requisitos Funcionais

## 🎯 Objetivo
Um sistema de "Segundo Cérebro" para organizar estudos bíblicos, focado em interconexões e revisão inteligente.

## 🏗️ Hierarquia de Dados
1. **Livro:** Agrupador principal (ex: Provérbios).
2. **Capítulo:** Subdivisão por livro (ex: Provérbios 16).
3. **Texto de Estudo:** Notas individuais criadas pelo usuário.
4. **Conteúdo:** Texto rico com suporte a blocos (títulos, listas, checkboxes).

## 🔗 Sistema de Conexões (Grafo)
- **Backlog de Estudo:** Ativado por `/` no editor. Adiciona livro/capítulo a uma lista "Para Estudar".
- **Links Manuais:** Seleção de texto > Menu > "Referenciar". Cria conexão bidirecional entre a nota atual e uma nota existente.
- **Sincronização:** Se um link for apagado no texto, ele deve ser removido do banco de dados ao salvar.

## 🏷️ Tags e Metadados
- **Tipos de Tag:** #Versículos, #Temas, #Princípios.
- **Rastreabilidade:** Cada card deve conter `created_at`, `updated_at`, `completed_at` e `source_study_id` (se originado de um backlog).

## 🔄 Revisão (Curva de Esquecimento)
- Sugestões automáticas de revisão em: 1 dia, 7 dias e 30 dias após a conclusão.