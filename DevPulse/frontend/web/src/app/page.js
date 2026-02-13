"use server";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Code2, Rocket, Share2, Star, Zap, TrendingUp, Users, Github, Eye, Heart } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] transition-colors duration-500 overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid Pattern using variable border color */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, var(--border-color) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border-color) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 40%, black, transparent)'
          }} />
          
          {/* Theme-Aware Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          
          {/* Floating Code Symbols (Subtle in both modes) */}
          <div className="absolute top-20 left-[10%] text-indigo-500/10 text-6xl font-mono animate-float">&lt;/&gt;</div>
          <div className="absolute top-40 right-[15%] text-purple-500/10 text-5xl font-mono animate-float" style={{ animationDelay: '1s' }}>{ }</div>
          <div className="absolute bottom-40 left-[20%] text-pink-500/10 text-4xl font-mono animate-float" style={{ animationDelay: '2s' }}>[ ]</div>
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--nav-active-bg)] border border-indigo-500/20 mb-12 backdrop-blur-sm hover:border-indigo-500/40 transition-all group cursor-default animate-fade-in shadow-sm">
            <Star className="w-4 h-4 text-indigo-500 fill-indigo-500 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold text-indigo-500 tracking-wide uppercase">The #1 Developer Showcasing Platform</span>
            <div className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl md:text-9xl font-black text-[var(--nav-text-active)] tracking-tighter mb-8 animate-slide-up leading-[0.9]">
            Code. Sync.
            <br />
            <span className="relative inline-block mt-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient">
                Get Recognized.
              </span>
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl -z-10 animate-pulse" />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-[var(--nav-text-muted)] max-w-3xl mx-auto mb-16 leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '0.2s' }}>
            Stop letting your side projects <span className="text-[var(--nav-text-active)] font-bold">die in private repositories</span>. 
            <br className="hidden md:block" />
            Sync your GitHub, showcase your craft, and let the{" "}
            <span className="text-indigo-600 font-black">
              community decide your rank
            </span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link
              href={userId ? "/dashboard" : "/sign-up"}
              className="group relative px-12 py-6 bg-indigo-600 text-white font-black text-lg rounded-2xl overflow-hidden transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3">
                <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <span>{userId ? "Go to Dashboard" : "Start Flexing Now"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
            
            <Link
              href="/media"
              className="group px-12 py-6 bg-[var(--card-bg)] text-[var(--nav-text-active)] font-black text-lg rounded-2xl border-2 border-[var(--border-color)] hover:border-indigo-500 transition-all backdrop-blur-md shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6" />
                <span>Explore Gallery</span>
              </div>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { val: "10K+", label: "Developers" },
              { val: "50K+", label: "Projects" },
              { val: "1M+", label: "Views" },
              { val: "100K+", label: "Stars Given" }
            ].map((stat, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-indigo-500/50 transition-all hover:scale-105 shadow-xl">
                <div className="relative">
                  <div className="text-4xl font-black text-[var(--nav-text-active)] mb-2">{stat.val}</div>
                  <div className="text-xs text-[var(--nav-text-muted)] font-bold uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="relative py-32 bg-[var(--nav-hover-bg)] border-y border-[var(--border-muted)]">
        <div className="container relative z-10 mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 shadow-sm">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-black text-indigo-600 tracking-widest">POWERFUL FEATURES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-[var(--nav-text-active)] mb-6 tracking-tight">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-[var(--nav-text-muted)] max-w-2xl mx-auto font-medium">
              Built for developers who are serious about showcasing their work
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Github, title: "GitHub Sync", desc: "Connect your GitHub account and automatically showcase your best repositories with real-time updates.", color: "from-indigo-500 to-purple-500" },
              { icon: TrendingUp, title: "Community Ranking", desc: "Get ranked based on project quality, engagement, and community votes. Rise to the top of the leaderboard.", color: "from-purple-500 to-pink-500" },
              { icon: Share2, title: "Share Anywhere", desc: "Beautiful project cards ready to share on social media, in your portfolio, or with potential employers.", color: "from-pink-500 to-indigo-500" }
            ].map((f, i) => (
              <div key={i} className="group relative p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-indigo-500/50 transition-all hover:transform hover:-translate-y-2 shadow-2xl">
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <f.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-[var(--nav-text-active)] mb-4">{f.title}</h3>
                  <p className="text-[var(--nav-text-muted)] leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent blur-3xl opacity-30" />
        
        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black text-[var(--nav-text-active)] mb-8 tracking-tight">
            Ready to Get{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Discovered
            </span>?
          </h2>
          <p className="text-xl text-[var(--nav-text-muted)] max-w-2xl mx-auto mb-12 font-medium">
            Join thousands of developers who are already showcasing their work and building their reputation.
          </p>
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="group inline-flex items-center gap-3 px-16 py-7 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95"
          >
            <Rocket className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>{userId ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}