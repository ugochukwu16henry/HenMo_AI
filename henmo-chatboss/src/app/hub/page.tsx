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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/";
      setUser(data.user);
      loadMemories();
    });
  }, []);

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

  const startEdit = (m: Memory) => {
    setEditingId(m.id);
    setEditTitle(m.title);
    setEditContent(m.content);
  };

  const saveEdit = async () => {
    await supabase.from("user_memory").update({
      title: editTitle,
      content: editContent
    }).eq("id", editingId);
    setEditingId(null);
    loadMemories();
  };

  const exportMemories = () => {
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HenMo-Memories.json";
    a.click();
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
          <button onClick={exportMemories} className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold text-xl">
            Export All
          </button>
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
                {editingId === m.id ? (
                  <div>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full mb-4 px-4 py-2 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
                      placeholder="Title"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-48 px-4 py-2 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
                    />
                    <div className="flex justify-end mt-4">
                      <button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold mr-4">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-xl font-bold">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-purple-300 mb-4">
                      {m.title || "Untitled Memory"}
                    </h3>
                    <p className="text-gray-300 mb-6 line-clamp-6">{m.content}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-70">
                        {new Date(m.created_at).toLocaleDateString()}
                      </span>
                      <div className="space-x-3">
                        <button onClick={() => startEdit(m)} className="text-blue-400 font-bold">Edit</button>
                        <button onClick={() => deleteMemory(m.id)} className="text-red-400 font-bold">Delete</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
