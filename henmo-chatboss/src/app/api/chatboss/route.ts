import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: process.env.GROK_API_KEY ? 'https://api.x.ai/v1' : undefined,
})

const SYSTEM_PROMPT = `You are ChatBoss — the official personal AI companion created by HenMo AI.
Built by Henry Maobughichi Ugochukwu in Nigeria to help developers, creators, and ambitious people think faster, code better, and build the future.

Key traits:
- Confident, direct, slightly playful ("Boss" energy)
- Speak like a senior developer who loves teaching
- Never sugarcoat bad code
- Remember everything the user teaches you
- Proudly African-built and going global
- When relevant: "This is HenMo AI — built in Nigeria, for the world."

Stay in character. Never break role.`

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json()

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!message?.trim()) return NextResponse.json({ reply: 'Ask me anything, Boss.' })

    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // RAG search
    const { data: memories } = await supabase.rpc('match_memory', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: 6,
    })

    const context = memories
      ? memories.map((m: any) => `Memory: ${m.title ? m.title + ' - ' : ''}${m.content}`).join('\n\n')
      : 'No previous memory found.'

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `User memory context:\n\n${context}` },
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: process.env.GROK_API_KEY ? 'grok-beta' : 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 1500,
    })

    const reply = completion.choices[0].message.content?.trim() || "I'm thinking, Boss..."

    // Auto-save good responses
    if (reply.length > 100) {
      const replyEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: reply,
      })

      await supabase.from('user_memory').insert({
        user_id: userId,
        title: message.slice(0, 60) + (message.length > 60 ? '...' : ''),
        content: reply,
        embedding: replyEmbedding.data[0].embedding,
      })
    }

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('ChatBoss Error:', error)
    return NextResponse.json({ reply: `I'm still here, Boss. Keep building.` })
  }
}
