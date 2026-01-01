import Link from "next/link";
import { ArrowRight, Hammer, TrendingUp, Sparkles } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";

export default function Home() {
  return (
    <div className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <main className="wrapper pt-20 sm:pt-32 pb-40">
        <div className="text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/20 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 animate-bounce">
              <Sparkles className="w-3 h-3" /> Albion Live Data
            </div>
            <h1 className="text-5xl font-black tracking-tighter sm:text-8xl lg:text-9xl leading-[0.8] sm:leading-[0.8]">
              DOMINATE <br />
              <span className="text-gradient">THE MARKET</span>
            </h1>
          </div>

          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
            The professional tool for Albion Online entrepreneurs. Track live
            prices, calculate refinement profits, and find crafting gaps
            instantly.
          </p>

          <div className="max-w-2xl mx-auto pt-6 px-4">
            <SearchBar />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12 px-4">
            <Link
              href="/refine"
              className="group glass-card hover:border-primary/50 transition-all p-10 text-center flex-1 max-w-sm"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-primary/5">
                <Hammer className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-black text-2xl mb-2 tracking-tight">
                REFINE <br /> ANALYZER
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                Calculate the perfect return rate and profit margins for any
                material.
              </p>
              <div className="flex items-center justify-center text-primary font-black text-xs gap-2 uppercase tracking-widest group-hover:gap-4 transition-all">
                Launch <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/craft"
              className="group glass-card hover:border-primary/50 transition-all p-10 text-center flex-1 max-w-sm"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-primary/5">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-black text-2xl mb-2 tracking-tight">
                PROFITTING <br /> ENGINE
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">
                Discover market gaps and find the best items to craft right now.
              </p>
              <div className="flex items-center justify-center text-primary font-black text-xs gap-2 uppercase tracking-widest group-hover:gap-4 transition-all">
                Launch <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Decorative Glow */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-400 to-primary opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
}
