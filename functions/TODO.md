🛠️ Checklist de Implementação: Neural Deck Backend

Siga estes passos para garantir que sua lógica está correta antes de fazer o firebase deploy.

1. Estrutura de Pastas (Onde os arquivos ficam)

[ ] Pasta functions/: Os arquivos index.js, package.json e .env estão todos dentro dela?

[ ] Independência: Você verificou se não há arquivos de lógica soltos na raiz do projeto Firebase (fora da functions)?

2. Preparação de Ambiente

[ ] Arquivo .env criado dentro de functions/ com GEMINI_API_KEY.

[ ] .env adicionado ao seu .gitignore (na raiz do projeto ou dentro de functions/).

3. Lógica do index.js

[ ] Importação: A biblioteca @google/generative-ai foi importada corretamente?

[ ] Instanciação: O objeto genAI está usando a variável de ambiente?

[ ] Body Parsing: Você conseguiu extrair o topic do req.body?

[ ] Fallback de Persona: Se o usuário enviar uma persona inexistente, o código volta para a default?

[ ] Template String: O prompt final combina as regras do H.O.M.E.S. com o tema do usuário?

[ ] Async/Await: Você usou await na chamada do generateContent?

[ ] Tratamento de Erros: O catch está enviando o erro de volta como JSON?

4. Validação Técnica (Big Tech Standard)

[ ] O código usa const e let corretamente (evitando var).

[ ] O logger.info está sendo usado para monitorar as requisições.

[ ] O código não expõe a API Key em logs ou comentários.