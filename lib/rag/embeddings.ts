import { OpenAIEmbeddings } from "@langchain/openai";

// Usar el modelo text-embedding-3-small por su balance costo/efectividad
// Dimensiones por defecto: 1536
let embeddingsInstance: OpenAIEmbeddings | null = null;

function getEmbeddingsInstance() {
  if (!embeddingsInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    // During build time or if key is missing, this might fail if we initialize strictly.
    // However, we only initialize when needed (runtime).
    embeddingsInstance = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      // Asegurar que las dimensiones coincidan con la base de datos (1536 es standard)
      dimensions: 1536,
      apiKey: apiKey || "dummy-key-for-build", // Fallback for build time if somehow instantiated
    });
  }
  return embeddingsInstance;
}

/**
 * Genera el vector de embeddings para un texto dado utilizando OpenAI.
 * Es fundamental para convertir texto en representaciones numéricas que permitan
 * la búsqueda semántica.
 * 
 * @param text - El texto a vectorizar.
 * @returns Array de números representando el embedding.
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const embeddings = getEmbeddingsInstance();
    const vector = await embeddings.embedQuery(text);
    return vector;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error("Failed to generate embeddings");
  }
}
