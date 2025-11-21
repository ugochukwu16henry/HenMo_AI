'use client';

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  if (user) {
    return (
      <div className=\
min-h-screen
bg-gradient-to-br
from-indigo-900
via-purple-900
to-pink-800
flex
items-center
justify-center
p-6\>
        <div className=\text-center
text-white\>
          <h1 className=\text-6xl
font-black
mb-4\>Welcome back, Boss</h1>
          <p className=\text-2xl
mb-8\>ChatBoss by HenMo AI is ready</p>
          <a href=\/chatboss\ className=\inline-block
px-12
py-6
bg-white
text-indigo-900
text-xl
font-bold
rounded-2xl
hover:scale-105
transition\>
            Enter ChatBoss
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className=\min-h-screen
bg-gradient-to-br
from-indigo-900
via-purple-900
to-pink-800
flex
items-center
justify-center
p-6\>
      <div className=\max-w-md
w-full
bg-white/10
backdrop-blur-xl
rounded-3xl
p-10
shadow-2xl
border
border-white/20\>
        <div className=\text-center
mb-8\>
          <h1 className=\text-5xl
font-black
text-white
mb-2\>HenMo AI</h1>
          <h2 className=\text-4xl
font-bold
text-white
mt-4\>ChatBoss</h2>
          <p className=\text-white/80
mt-4\>Your Personal AI Companion<br/>Built in Africa • For the World</p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme=\dark\
          providers={['google', 'github']}
        />

        <p className=\text-center
text-white/70
text-sm
mt-8\>
          © 2025 HenMo AI – Henry Maobughichi Ugochukwu
        </p>
      </div>
    </div>
  )
}
