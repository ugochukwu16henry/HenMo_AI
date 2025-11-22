"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PaystackPop from "@paystack/inline-js";

export default function Billing() {
  const [user, setUser] = useState<any>(null);
  the [premium, setPremium] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/";
      setUser(data.user);
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

  const subscribe = () => {
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 50000, // ₦500 in kobo
      onSuccess: async (transaction) => {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          status: "active",
        });
        setPremium(true);
        alert("Premium unlocked!");
      },
      onCancel: () => alert("Cancelled"),
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HenMo AI Premium
        </h1>
        <p className="text-xl opacity-80 mb-12">Unlock unlimited memories, priority AI, and more for ₦500/month.</p>

        {premium ? (
          <p className="text-3xl text-green-400">You are Premium! Enjoy unlimited power.</p>
        ) : (
          <button onClick={subscribe} className="w-full bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-bold text-xl">
            Subscribe for ₦500/month
          </button>
        )}
      </div>
    </div>
  );
}
