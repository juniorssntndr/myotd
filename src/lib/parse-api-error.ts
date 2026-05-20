export async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string }
    return data.error || data.message || fallback
  } catch {
    return fallback
  }
}
