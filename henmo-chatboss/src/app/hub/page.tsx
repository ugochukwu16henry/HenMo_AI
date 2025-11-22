"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Memory {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function HenMoHub() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [search, setSearch] = useState("");
  const [premium, setPremium] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/";
      setUser(data.user);
      loadMemories();
      checkPremium(data.user.id);
    });
  }, []);

  const checkPremium = async (userId: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "active");

    setPremium(!!data?.length);
  };

  const loadMemories = async () => {
    const { data } = await supabase
      .from("user_memory")
      .select("*")
      .order("created_at", { ascending: false });
    setMemories(data || []);
  };

  const filtered = memories.filter(m =>
    (m.title || "").toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMemory = async (id: string) => {
    await supabase.from("user_memory").delete().eq("id", id);
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-7xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              HenMo Hub
            </h1>
            <p className="text-3xl opacity-80 mt-4">Your Personal Brain • {memories.length} memories</p>
          </div>
          <p className="text-2xl font-bold {premium ? 'text-green-400' : 'text-red-400'}">
            {premium ? "Premium Unlocked" : "Free Plan (10 memories max)"}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search your memories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-10 px-8 py-5 bg-gray-900 border border-purple-600 rounded-2xl text-xl focus:outline-none focus:border-purple-400"
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-3xl opacity-50 py-20">
              No memories yet. Start chatting with ChatBoss!
            </p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-600 rounded-3xl p-8 backdrop-blur-xl hover:scale-105 transition">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">
                  {m.title || "Untitled Memory"}
                </h3>
                <p className="text-gray-300 mb-6 line-clamp-6">{m.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-70">
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
            ))
          )}
        </div>

        {!premium && memories.length >= 10 && (
          <p className="text-center text-2xl text-red-400 mt-12">
            Upgrade to Premium for unlimited memories!
          </p>
        )}
      </div>
    </div>
  );
}
<div className='mt-12'><a href='/billing' className='inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-2xl hover:scale-105 transition'>Upgrade to Premium</a></div>
