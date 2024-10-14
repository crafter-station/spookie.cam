// Types
export type EmbeddingInput = {
  text?: string;
  image?: string;
};

type EmbeddingData = {
  object: string;
  index: number;
  embedding: number[];
};

type ApiResponse = {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: EmbeddingData[];
};

// Function to get embeddings
export async function getEmbeddings(
  inputs: EmbeddingInput[],
): Promise<ApiResponse> {
  const url = 'https://api.jina.ai/v1/embeddings';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'jina-clip-v1',
        normalized: true,
        embedding_type: 'float',
        input: inputs,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
