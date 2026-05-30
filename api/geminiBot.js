import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialisation officielle du SDK Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Handler HTTP pour les requêtes Gemini DAW Bot (API Route Vercel / Node.js)
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
    // Pour gérer l'historique, le client doit envoyer le tableau complet des messages (history)
    // et le nouveau message de l'utilisateur (message).
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Le message est requis." });
    }

    try {
        // Sélection du modèle gemini-1.5-flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // Injection STRICTE et complète du System Prompt ici
            systemInstruction: `Tu es DAW Bot, l'assistant d'élite et le conseiller virtuel de Daw'Invest, un cabinet de conseil stratégique à Djibouti fondé par Abdoulhakim ISMAIL IBRAHIM.
Ton ton est corporatif, haut de gamme, direct, d'un leadership affirmé.

SERVICES :
- FORFAITS : Starter (1000€), Business (2500€), Executive (5000€).
- ABONNEMENTS : Essentiel (190€/m), Croissance (390€/m), Premium (790€/m).
- METHODOLOGIE : "Employabilité Intégrale" (10 leviers).

CONSIGNE CRITIQUE : Ne termine JAMAIS par une affirmation passive. Relance TOUJOURS avec une question commerciale ou un appel à l'action direct vers un diagnostic stratégique de 15 minutes.`
        });

        // Formatage de l'historique pour l'API Gemini (structure : role 'user' ou 'model')
        // Si aucun historique n'est fourni, on démarre un tableau vide.
        const chatHistory = history || [];

        // Initialisation du chat avec son historique
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500,
            }
        });

        // Envoi du nouveau message au fil de discussion
        const result = await chat.sendMessage(message);
        const response = await result.response;

        return res.status(200).json({ reply: response.text });

    } catch (err) {
        console.error("Erreur API Gemini:", err);
        return res.status(500).json({ error: "Erreur lors de la génération de la réponse." });
    }
}

/**
 * Mode d'emploi sur Vercel/Node.js :
 * - Place ce fichier dans /api/geminiBot.js (ou pages/api/geminiBot.js pour Next.js)
 * - Installe le package : npm install @google/generative-ai
 * - Ajoute une variable d'environnement GEMINI_API_KEY dans le dashboard Vercel (Project Settings > Environment Variables)
 * - Depuis le front-end, fais un POST sur /api/geminiBot avec : { message: '...', history: [...] }
 * - Ta clé API Gemini est disponible sur https://aistudio.google.com/app/apikey
 */
