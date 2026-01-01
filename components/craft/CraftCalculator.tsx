"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Hammer, Coins, TrendingUp } from "lucide-react";

export default function CraftCalculator() {
  const [amount, setAmount] = useState(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Input */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Hammer className="w-5 h-5" />
            <h2 className="font-bold uppercase text-sm tracking-widest">
              Base Crafting
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantity to craft</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label>Crafting Fee</Label>
              <Input type="number" placeholder="555" className="glass-input" />
            </div>
          </div>
        </div>

        <div className="glass-card bg-primary/5">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Coins className="w-5 h-5" />
            <h2 className="font-bold uppercase text-sm tracking-widest">
              Cost Summary
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materials Total</span>
              <span className="font-mono">124,500</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Station Fees</span>
              <span className="font-mono">12,000</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-white/5">
              <span>Total Cost</span>
              <span className="text-red-400">136,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Results & Item Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-xl font-bold">Profit Analysis</h2>
            </div>
            <span className="text-green-400 font-black text-xl">
              +45,200 Silver
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[4, 5, 6, 7].map((tier) => (
              <motion.div
                key={tier}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center font-black text-primary">
                    T{tier}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold">Adept's Bag</h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        Est. Profit
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        +12%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
