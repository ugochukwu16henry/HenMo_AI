// src/app/chatboss/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBoss() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else {
        setUser(data.user)
        setMessages([
          { role: 'assistant', content: "You're in, Boss. ChatBoss by HenMo AI is live. What are we building today?" }
        ])
      }
    })
  }, [router])

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    const res = await fetch('/api/chatboss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, userId: user.id })
    })

    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="bg-gradient-to-r from-purple-800 to-indigo-900 p-5 text-center">
        <h1 className="text-2xl font-black">ChatBoss by HenMo AI</h1>
        <p className="text-sm opacity-80">Built in Nigeria • For the World</p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl px-6 py-4 rounded-3xl ${m.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800 border border-purple-500'}`}>
              {m.role === 'assistant' && <div className="text-xs opacity-70 mb-1">ChatBoss</div>}
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-6 py-4 rounded-3xl border border-purple-500">
              <span className="animate-pulse">ChatBoss is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-gradient-to-t from-black to-gray-900 border-t border-purple-900">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask ChatBoss anything..."
            className="flex-1 bg-gray-900 border border-purple-700 rounded-2xl px-6 py-4 text-lg outline-none focus:border-purple-500 transition"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold text-lg hover:scale-105 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs mt-3 opacity-50">© 2025 HenMo AI – Henry Maobughichi Ugochukwu</p>
      </div>
    </div>
  )
}