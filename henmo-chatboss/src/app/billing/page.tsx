// src/app/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PaystackPop from "@paystack/inline-js";
import { useRouter } from "next/navigation";

export default function Billing() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Load authenticated user
  // ----------------------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      // If no user found → redirect safely
      if (!data?.user) {
        router.replace("/");
        return;
      }

      setUser(data.user);
      checkPremium(data.user.id);
    };

    loadUser();
  }, [router]);

  // ----------------------------
  // Check subscription table
  // ----------------------------
  const checkPremium = async (userId: string) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    setPremium(!!data);
    setLoading(false);
  };

  // ----------------------------
  // Paystack Subscription
  // ----------------------------
  const subscribe = () => {
    if (!user) {
      alert("User not loaded yet.");
      return;
    }

    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: user.email,
      amount: 50000, // ₦500 (kobo)
      currency: "NGN",
      ref: "henmo_" + Math.floor(Math.random() * 1000000000 + 1),

      onSuccess: async (transaction: any) => {
        await supabase.from("subscriptions").upsert({
          user_id: user.id,
          status: "active",
        });

        setPremium(true);
        alert("Welcome to HenMo AI Premium! Unlimited memories unlocked.");
      },

      onCancel: () => {
        alert("Payment cancelled");
      },
    } as any);
  };

  // ----------------------------
  // Loading Screen
  // ----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-3xl">
        Loading...
      </div>
    );
  }

  // ----------------------------
  // Main Billing UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-black/50 backdrop-blur-xl rounded-3xl p-12 border border-purple-500 text-center">
        
        <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          HenMo AI Premium
        </h1>

        <p className="text-2xl mb-12 text-gray-300">
          Unlock unlimited memories, priority AI responses, and future premium features.
        </p>

        {premium ? (
          <div className="text-green-400 text-4xl font-bold">
            ✓ You are Premium! Enjoy unlimited power.
          </div>
        ) : (
          <div>
            <p className="text-5xl font-bold mb-8">
              ₦500 <span className="text-2xl">/ month</span>
            </p>

            <button
              onClick={subscribe}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-2xl py-6 rounded-2xl transition transform hover:scale-105"
            >
              Subscribe Now with Paystack
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
