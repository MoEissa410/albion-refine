"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const RESOURCE_TYPES = [
  { id: "WOOD", name: "Wood / Planks", color: "text-green-500" },
  { id: "ORE", name: "Ore / Bars", color: "text-blue-400" },
  { id: "FIBER", name: "Fiber / Cloth", color: "text-yellow-400" },
  { id: "HIDE", name: "Hide / Leather", color: "text-red-500" },
  { id: "STONE", name: "Stone / Blocks", color: "text-gray-400" },
];

export default function RefineCalculator() {
  const [resource, setResource] = useState("WOOD");
  const [returnRate, setReturnRate] = useState(36.7);
  const [city, setCity] = useState("Caerleon");

  return (
    <div className="space-y-10">
      {/* Settings Card */}
      <div className="glass-card grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Resource Type</Label>
          <Select value={resource} onValueChange={setResource}>
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((r) => (
                <SelectItem key={r.id} value={r.id} className={r.color}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Return Rate (%)</Label>
          <Input
            type="number"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            className="glass-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Target City</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Caerleon">Caerleon</SelectItem>
              <SelectItem value="Lymhurst">Lymhurst</SelectItem>
              <SelectItem value="Bridgewatch">Bridgewatch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[4, 5, 6, 7, 8].map((tier) => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card border-t-4 border-primary"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-black opacity-20">T{tier}</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                Profit: +1.2M
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raw Price</span>
                <span className="font-mono">450</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prev Tier Price</span>
                <span className="font-mono">1,200</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Price</span>
                <span className="font-mono text-green-400">3,400</span>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors text-primary font-bold text-sm">
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
