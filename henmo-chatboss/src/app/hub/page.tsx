"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Memory {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function HenMoHub() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/");
      else setUser(data.user);
    });
  }, [router]);

  useEffect(() => {
    if (user) loadMemories();
  }, [user]);

  const loadMemories = async () => {
    const { data } = await supabase
      .from("user_memory")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setMemories(data || []);
  };

  const deleteMemory = async (id: string) => {
    await supabase.from("user_memory").delete().eq("id", id);
    setMemories(memories.filter(m => m.id !== id));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HenMo Hub
        </h1>
        <p className="text-xl opacity-80 mb-12">Your Personal Brain • {memories.length} memories</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-2xl p-6 backdrop-blur-xl">
              <h3 className="text-xl font-bold mb-3">{memory.title || "Untitled"}</h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-4">{memory.content}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-60">
                  {new Date(memory.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {memories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl opacity-50">No memories yet. Start chatting with ChatBoss!</p>
          </div>
        )}
      </div>
    </div>
  );
}
