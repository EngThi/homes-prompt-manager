### Tarefas Concluídas:

1.  **Implementar engenharia de prompt baseada em persona:**
    *   Adicionado seletor de persona no `index.html`.
    *   Refatorado `main.js` para usar um objeto `PERSONAS` no `CONFIG` e gerar prompts dinamicamente.

2.  **Melhorar o tratamento de erros com notificações toast:**
    *   Substituído `alert()` por um sistema de notificação toast (`showToast` function).
    *   Adicionado HTML/CSS para o toast.
    *   Melhorado o feedback de erro da API.

3.  **Implementar sincronização de áudio/texto:**
    *   Modificado `main.js` para realçar o texto no `textarea` durante a fala da IA.
    *   Implementado rolagem automática para manter o texto realçado visível.

4.  **Organização do Projeto:**
    *   Todos os arquivos do projeto foram movidos para a pasta `MeusProjetosDev`.

### Tarefas Pendentes:

1.  **Implementar armazenamento em nuvem para persistência:**
    *   **Status:** Bloqueado - Aguardando configurações do Firebase (apiKey, projectId, etc.).
    *   **Objetivo:** Substituir `localStorage` por uma solução de armazenamento mais robusta (Firestore).

2.  **Conectar o visualizador de áudio à Web Audio API:**
    *   **Status:** Pendente.
    *   **Objetivo:** Fazer com que o visualizador de áudio reaja à frequência real da voz, em vez de ser uma animação CSS fixa.
