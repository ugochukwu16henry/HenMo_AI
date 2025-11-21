"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function HenMoHub() {
  const [memories, setMemories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/");
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMemories(data || []));
    }
  }, [user]);

  const deleteMemory = async (id: string) => {
    await supabase.from("user_memory").delete().eq("id", id);
    setMemories(memories.filter(m => m.id !== id));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HenMo Hub
        </h1>
        <p className="text-2xl opacity-80 mb-12">Your Personal Brain • {memories.length} memories</p>

        {memories.length === 0 ? (
          <p className="text-center text-3xl opacity-50">No memories yet. Start chatting with ChatBoss!</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {memories.map((m) => (
              <div key={m.id} className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500 rounded-2xl p-8 backdrop-blur-xl">
                <h3 className="text-2xl font-bold mb-4">{m.title || "Untitled"}</h3>
                <p className="text-gray-300 mb-6 line-clamp-6">{m.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-60">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteMemory(m.id)}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
