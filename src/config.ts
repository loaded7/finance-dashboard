// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env || {}
export const BRAPI_TOKEN: string = env.VITE_BRAPI_TOKEN || ''
export const GROQ_API_KEY: string = env.VITE_GROQ_API_KEY || ''
export const GROQ_MODEL = 'llama-3.3-70b-versatile'
