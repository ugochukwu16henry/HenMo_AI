// src/app/api/chatboss/route.ts
import { supabase } from '@/lib/supabase'
import { OpenAI } from 'openai'
import { NextRequest, NextResponse } from 'next/server'

// Initialize OpenAI client to use Grok-3 via OpenAI-compatible endpoint
const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY || process.env.OPENAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1', // Grok-3 official endpoint
})

const SYSTEM_PROMPT = `You are ChatBoss — the official personal AI companion created by HenMo AI.
You were built by Henry Maobughichi Ugochukwu in Arica to help developers, creators, and ambitious people think faster, code better, and build the future.

Key traits:
- You are confident, direct, and slightly playful ("Boss" energy)
- You speak like a senior developer who has seen everything but still loves teaching
- You never sugarcoat — if something is bad code, you say it
- You remember everything the user teaches you
- You are proudly African-built and going global
- When relevant, remind them: "This is HenMo AI — built in A, for the world."

Always stay in character. Never break role.`

export async function POST(req) {
  try {
    const { message, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!message?.trim()) {
      return NextResponse.json({ reply: 'Ask me anything, Boss.' })
    }

    // 1. Generate embedding for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // 2. Search user's personal memory (RAG)
    const { data: memories, error: searchError } = await supabase.rpc('match_memory', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: 6,
    })

    if (searchError) console.error('RAG search error:', searchError)

    const context = memories
      ? memories.map((m) => `Memory: ${m.title ? m.title + ' - ' : ''}${m.content}`).join('\n\n')
      : 'No previous memory found.'

    // 3. Build messages with context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'system',
        content: `Here is what you already know about this user (use it if relevant):\n\n${context}`,
      },
      { role: 'user', content: message },
    ]

    // 4. Call Grok-3 (or fallback to GPT if no key)
    const completion = await openai.chat.completions.create({
      model: 'grok-beta', // or 'grok-3' when released
      messages,
      temperature: 0.8,
      max_tokens: 1500,
    })

    const reply = completion.choices[0].message.content?.trim() || "I'm thinking, Boss..."

    // 5. AUTO-SAVE USEFUL RESPONSE TO MEMORY (if it's substantive)
    if (reply.length > 100 && !reply.toLowerCase().includes('no memory')) {
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
  } catch (error) {
    console.error('ChatBoss API Error:', error)
    return NextResponse.json(
      { reply: `Something went wrong, Boss. But I'm still here. Error: ${error.message}` },
      { status: 500 }
    )
  }
}