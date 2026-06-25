import axios from 'axios'

export const IMPROVE_PROMPT = (original: string, translated: string, targetLang: string): string =>
  `
You are a manga translation naturalizer. Your job is to rewrite machine-translated manga dialogue so it sounds natural and emotionally appropriate for the scene.

Original text: "${original}"
Machine translation: "${translated}"
Target language: ${targetLang === 'id' ? 'Indonesian (Bahasa Indonesia)' : targetLang}

Rules:
1. Keep the same meaning — do not add or remove information
2. Use casual, manga-appropriate tone (characters in manga rarely speak formally)
3. Match emotional intensity (shouting, whispering, dramatic, comedic)
4. Return ONLY the improved translation — no explanations, no labels, no quotes
5. If the machine translation is already natural, return it unchanged
`.trim()

export async function improveWithOllama(
  prompt: string,
  model: string,
  baseUrl: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${baseUrl}/api/generate`,
      {
        model,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 200 }
      },
      { timeout: 30_000 } // Ollama can be slow on first token
    )

    const text = response.data?.response?.trim()
    if (!text) {
      throw { code: 'AI_IMPROVE_FAILED', message: 'Ollama returned empty response.' }
    }
    return text
  } catch (error: unknown) {
    const err = error as {
      code?: string
      message?: string
      response?: {
        status?: number
        data?: {
          error?: string | { message?: string }
        }
      }
    }
    if (err.code === 'ECONNREFUSED') {
      throw {
        code: 'OLLAMA_OFFLINE',
        message: 'Ollama is not running. Start Ollama and try again.'
      }
    }
    if (err.response?.status === 404) {
      throw {
        code: 'OLLAMA_MODEL_NOT_FOUND',
        message: `Model '${model}' not found. Run: ollama pull ${model}`
      }
    }
    const errMessage =
      typeof err.response?.data?.error === 'string'
        ? err.response.data.error
        : (err.response?.data?.error as { message?: string })?.message ||
          err.message ||
          'Ollama integration failed.'
    throw {
      code: 'AI_IMPROVE_FAILED',
      message: errMessage
    }
  }
}

export async function improveWithGroq(prompt: string, apiKey: string): Promise<string> {
  const trimmedKey = apiKey.trim()
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: { Authorization: `Bearer ${trimmedKey}` },
        timeout: 15_000
      }
    )

    const text = response.data?.choices?.[0]?.message?.content?.trim()
    if (!text) {
      throw { code: 'AI_IMPROVE_FAILED', message: 'Groq returned empty response.' }
    }
    return text
  } catch (error: unknown) {
    const err = error as {
      code?: string
      message?: string
      response?: {
        status?: number
        data?: {
          error?: string | { message?: string }
        }
      }
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw {
        code: 'GROQ_INVALID_KEY',
        message: 'Groq API key is invalid. Update it in Settings.'
      }
    }
    if (err.response?.status === 429) {
      throw {
        code: 'GROQ_RATE_LIMIT',
        message: 'Groq rate limit reached. Try again in a moment.'
      }
    }
    const errMessage =
      typeof err.response?.data?.error === 'string'
        ? err.response.data.error
        : (err.response?.data?.error as { message?: string })?.message ||
          err.message ||
          'Groq integration failed.'
    throw {
      code: 'AI_IMPROVE_FAILED',
      message: errMessage
    }
  }
}
