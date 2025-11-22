"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

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
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const user = supabase.auth.getUser();
    if (!user) window.location.href = "/";
    
    loadMemories();
  }, []);

  const loadMemories = async () => {
    const { data } = await supabase
      .from("user_memory")
      .select("*")
      .order("created_at", { ascending: false });
    setMemories(data || []);
  };

  const filtered = memories.filter(m => 
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMemory = async (id: string) => {
    await supabase.from("user_memory").delete().eq("id", id);
    setMemories(memories.filter(m => m.id !== id));
  };

  const saveEdit = async (id: string) => {
    await supabase.from("user_memory").update({ content: editContent }).eq("id", id);
    setEditingId(null);
    loadMemories();
  };

  const exportAll = () => {
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HenMo-AI-Memories-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              HenMo Hub
            </h1>
            <p className="text-2xl opacity-80 mt-2">Your Personal Brain • {memories.length} memories</p>
          </div>
          <button onClick={exportAll} className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold text-xl">
            Export All
          </button>
        </div>

        <input
          type="text"
          placeholder="Search your memories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-8 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500 rounded-2xl p-6 backdrop-blur-xl">
              {editingId === m.id ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-48 bg-black/50 rounded-lg p-4 text-white"
                />
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-3 text-purple-300">{m.title || "Untitled"}</h3>
                  <p className="text-gray-300 mb-4 line-clamp-6">{m.content}</p>
                </>
              )}
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm opacity-60">
                  {format(new Date(m.created_at), "MMM d, yyyy")}
                </span>
                <div className="space-x-3">
                  {editingId === m.id ? (
                    <>
                      <button onClick={() => saveEdit(m.id)} className="text-green-400 font-bold">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(m.id); setEditContent(m.content); }} className="text-blue-400 font-bold">Edit</button>
                      <button onClick={() => deleteMemory(m.id)} className="text-red-400 font-bold">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
