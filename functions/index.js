/**
 * H.O.M.E.S. - Neural Deck Backend
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const cors = require("cors")({origin: true}); // Permite chamadas de origens externas

// Inicializa o Gemini com a API Key do ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

// Configuração das personas de roteiro
const CONFIG = {
  PERSONAS: {
    default: "Você é um roteirista profissional de canais Dark. Estilo envolvente e direto.",
    scientific: "Você é um divulgador científico. Estilo BBC/Documentário.",
    dramatic: "Você é um roteirista de suspense. Use tensão e mistério.",
    funny: "Você é um comediante. Use ironia e sarcasmo.",
  },
};

exports.gerarRoteiro = onRequest((req, res) => {
  // Habilita o CORS para a função
  cors(req, res, async () => {
    try {
      const { topic, persona } = req.body;
      
      // Validação da entrada
      if (!topic) {
        return res.status(400).json({
            success: false,
            message: "O parâmetro 'topic' é obrigatório.",
        });
      }

      const personaInstructions = CONFIG.PERSONAS[persona] || "default";

      logger.info(`Gerando roteiro para o tema: ${topic}`, {persona: persona || "default"});

      // Monta o prompt final para a IA
      const systemPrompt = `
${personaInstructions}
REGRAS IMUTÁVEIS DE FORMATO:
- Duração: exatos 60 segundos de fala.
- Saída: Divida estritamente em blocos [NARRAÇÃO] e [VISUAL].
- Proibido: Não use timestamps, introduções genéricas ou comentários extras.
- Idioma: Português do Brasil ou inglês.
`;
      const finalPrompt = `${systemPrompt}\n\nTEMA DO VÍDEO: ${topic}`;

      // Gera o conteúdo com a IA Generativa
      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();

      // Retorna o roteiro gerado com sucesso
      res.status(200).json({
        success: true,
        content: text,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Falha na geração de roteiro:", error);

      // Retorna uma resposta de erro genérica
      res.status(500).json({
        success: false,
        message: "Ocorreu um erro inesperado ao processar sua solicitação.",
      });
    }
  });
});
