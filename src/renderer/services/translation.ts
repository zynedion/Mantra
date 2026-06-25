import axios from 'axios'
import { ITranslationRequest, ITranslationResult } from '../types'
import { detectAndMap } from './language-detect'

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

function splitTextIntoChunks(text: string, maxLength: number = 500): string[] {
  const chunks: string[] = []
  let currentIndex = 0

  while (currentIndex < text.length) {
    let chunkLength = maxLength
    // Try to find clean boundary if chunk cuts in mid-text
    if (currentIndex + chunkLength < text.length) {
      const slice = text.substring(currentIndex, currentIndex + chunkLength)
      const lastBoundary = Math.max(
        slice.lastIndexOf(' '),
        slice.lastIndexOf('\n'),
        slice.lastIndexOf('。'),
        slice.lastIndexOf('、')
      )
      if (lastBoundary > 0) {
        chunkLength = lastBoundary + 1
      }
    }

    chunks.push(text.substring(currentIndex, currentIndex + chunkLength))
    currentIndex += chunkLength
  }

  return chunks
}

async function translateChunk(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const response = await axios.get(MYMEMORY_URL, {
    params: {
      q: text,
      langpair: `${sourceLang}|${targetLang}`
    },
    timeout: 10_000
  })

  const data = response.data

  if (
    data.responseStatus !== 200 ||
    !data.responseData?.translatedText ||
    data.responseData.translatedText.startsWith('MYMEMORY WARNING')
  ) {
    throw new Error(data.responseData?.translatedText || 'MyMemory API returned an error.')
  }

  return data.responseData.translatedText
}

export async function translateText(request: ITranslationRequest): Promise<ITranslationResult> {
  const sourceLang = request.sourceLang ?? detectAndMap(request.text)
  const targetLang = request.targetLang

  if (!request.text.trim()) {
    throw { code: 'TRANSLATION_FAILED', message: 'No text to translate.' }
  }

  try {
    const chunks = splitTextIntoChunks(request.text, 500)
    const translationPromises = chunks.map((chunk) => translateChunk(chunk, sourceLang, targetLang))
    const translatedChunks = await Promise.all(translationPromises)
    const translatedText = translatedChunks.join(' ')

    return {
      translatedText,
      sourceLang,
      targetLang,
      provider: 'mymemory'
    }
  } catch (error: unknown) {
    const err = error as Record<string, unknown>
    throw {
      code: 'TRANSLATION_FAILED',
      message: (err.message as string) || 'Translation failed.'
    }
  }
}
