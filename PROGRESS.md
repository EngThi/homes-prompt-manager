### Tarefas Concluídas:

1.  **Migração para Gemini 3 & Ferramentas Avançadas:**
    *   Atualizado modelo para `gemini-3-flash-preview`.
    *   Implementado "Thinking Mode" (Raciocínio de Alto Nível).
    *   Ativado "Google Search Tool" para pesquisas em tempo real via API.

2.  **Arquitetura Híbrida (Dev/Prod):**
    *   Refatorado `main.js` para suportar tanto API Key manual (acho q só para o reviewer do Hack Club) quanto chamadas seguras via Firebase Functions (Backend).
    *   Implementada detecção automática: Se o campo API Key estiver vazio, o sistema usa o Backend.

3.  **Ambiente de Aprendizado (Sandbox):**
    *   Criada a pasta `copia_de_estudos` com laboratório prático.
    *   Desenvolvimento e conclusão de lógica de integração assíncrona (Fetch, JSON, Loading States).

4.  **Engenharia de Prompt & Personas:**
    *   Adicionado seletor de persona no `index.html`.
    *   Refatorado `main.js` para usar um objeto `PERSONAS` no `CONFIG`.

5.  **Sincronização de Áudio/Texto:**
    *   Realce de texto no `textarea` durante a fala e rolagem automática.

### Tarefas Pendentes:

1.  **Implementar armazenamento em nuvem para persistência:**
    *   **Status:** Bloqueado - Aguardando configurações do Firebase (apiKey, projectId, etc.).
    *   **Objetivo:** Substituir `localStorage` por uma solução de armazenamento mais robusta (Firestore).

2.  **Conectar o visualizador de áudio à Web Audio API:**
    *   **Status:** Pendente.
    *   **Objetivo:** Fazer com que o visualizador de áudio reaja à frequência real da voz, em vez de ser uma animação CSS fixa.
