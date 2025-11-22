"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export default function StreetUpload() {
  const [streetName, setStreetName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `street-images/${uuid()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("street-images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("street-images").getPublicUrl(filePath);

    await supabase.from("street_uploads").insert({
      street_name: streetName,
      city,
      country,
      notes,
      image_url: data.publicUrl,
    });

    alert("Upload successful — awaiting verification");
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Street Image Upload
        </h1>
        <p className="text-xl opacity-80 mb-12">Earn by uploading real-time street images — Nigeria first, global soon.</p>

        <input
          type="text"
          placeholder="Street Name"
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          className="w-full mb-4 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
        />

        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full mb-4 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
        />

        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full mb-4 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full mb-4 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl focus:outline-none focus:border-purple-400"
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-6 px-6 py-4 bg-gray-900 border border-purple-500 rounded-xl text-xl"
        />

        <button onClick={handleUpload} disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold text-xl disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload Street Image"}
        </button>
      </div>
    </div>
  );
}
