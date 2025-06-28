'use client'

import Image from "next/image";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* Navigation with Dark Background for Red Logo */}
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
              <div className="relative">
                {/* Flying W Logo - Accurate replica of uploaded design */}
                <div className="w-20 h-12 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                  <svg width="80" height="48" viewBox="0 0 80 48" className="w-full h-full">
                    {/* Background matching header */}
                    <rect width="80" height="48" fill="#111827" />
                    
                    {/* Speed Lines - matching uploaded design */}
                    <polygon points="5,20 20,15 22,17 7,22" fill="url(#speedGrad1)" />
                    <polygon points="3,24 18,19 20,21 5,26" fill="url(#speedGrad2)" />
                    <polygon points="6,28 21,23 23,25 8,30" fill="url(#speedGrad3)" />
                    <polygon points="4,32 19,27 21,29 6,34" fill="url(#speedGrad4)" />
                    
                    {/* Main W Shape - precise replica */}
                    {/* Left outer stroke */}
                    <polygon points="28,8 35,40 42,38 35,6" fill="url(#wMainGrad)" />
                    
                    {/* Left inner stroke */}
                    <polygon points="38,8 45,32 50,30 43,6" fill="url(#wMainGrad)" />
                    
                    {/* Right inner stroke */}
                    <polygon points="48,6 55,30 60,32 53,8" fill="url(#wMainGrad)" />
                    
                    {/* Right outer stroke */}
                    <polygon points="58,6 65,38 72,40 65,8" fill="url(#wMainGrad)" />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="wMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="50%" stopColor="#DC2626" />
                        <stop offset="100%" stopColor="#B91C1C" />
                      </linearGradient>
                      <linearGradient id="speedGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7F1D1D" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                      <linearGradient id="speedGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#991B1B" />
                        <stop offset="100%" stopColor="#DC2626" />
                      </linearGradient>
                      <linearGradient id="speedGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#B91C1C" />
                        <stop offset="100%" stopColor="#F87171" />
                      </linearGradient>
                      <linearGradient id="speedGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7F1D1D" />
                        <stop offset="100%" stopColor="#DC2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">WaiverWire<span className="text-gray-400">.com</span></span>
                <div className="text-red-400 text-xs font-semibold tracking-wider">PLAY WITH THE EDGE</div>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#pricing" className="nav-link">Pricing</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/signin" className="link-hover text-red-400 font-medium px-3 py-2 rounded">Sign In</Link>
              <Link href="/auth/signin" className="glow-red bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Updated for the 2025 Fantasy Football Season
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
              {" "}Waiver Wire
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Waiver Wire is your ultimate resource for gaining a competitive edge in fantasy football. Our team of experts 
            analyzes thousands of data points to deliver insights that help you draft smarter, make better waiver claims, 
            and set winning lineups week after week.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a seasoned veteran or first-time player, our <strong>Assistant Coach</strong> tools and analysis 
            will elevate your fantasy game to championship level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin" className="btn-primary text-lg px-8 py-4 text-center shadow-lg">
              Get Started
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>

        {/* What We Offer Section */}
        <section id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive fantasy football tools designed to give you the winning edge
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Expert Position Analysis</h3>
              <p className="text-gray-600 text-sm">
                Position-specific breakdowns identify sleepers, breakout candidates, and draft values that make the difference between playoffs and championships.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Data-Driven Insights</h3>
              <p className="text-gray-600 text-sm">
                Our Assistant Coach analyzes advanced metrics like yards per route run, expected points added, and red zone opportunity share.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-2h1m3 0h1a2 2 0 011 2v2M7 7V5a2 2 0 011-2h1m3 0h1a2 2 0 011 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Winning Draft Strategies</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive draft guides based on your draft position, league settings, and scoring format from thousands of analyzed drafts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 card-hover">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Weekly Waiver Wire</h3>
              <p className="text-gray-600 text-sm">
                Stay ahead with weekly waiver wire recommendations, identifying valuable pickups before they become obvious additions.
              </p>
            </div>
          </div>
        </section>

        {/* 2025 Season Highlights */}
        <section className="mt-24 bg-white rounded-2xl p-12 shadow-lg border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              2025 Season Highlights
            </h2>
            <p className="text-lg text-gray-600">
              Key trends and developments that will shape your path to victory
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600 font-bold text-sm">QB</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quarterback Evolution</h3>
                  <p className="text-gray-600">The gap between elite options and streaming candidates continues to narrow, creating value in later rounds.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">RB</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Running Back Landscape</h3>
                  <p className="text-gray-600">While the elite tier remains shallow, emerging second and third-year backs create opportunities for modified Zero RB approaches.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-red-600 font-bold text-sm">WR</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Wide Receiver Depth</h3>
                  <p className="text-gray-600">With a record number of receivers projected for 1,000+ yard seasons, strategic drafting becomes even more crucial.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">TE</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tight End Advantage</h3>
                  <p className="text-gray-600">Identifying breakout tight end candidates provides one of the largest competitive advantages as the position evolves.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assistant Coach Features */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Assistant Coach Features
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools to support you throughout the fantasy season
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 card-hover">
              <h3 className="font-semibold text-gray-900 mb-3">Draft Preparation</h3>
              <p className="text-gray-600 text-sm mb-4">Customized rankings and real-time suggestions during your draft to build an optimal roster.</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• League-specific rankings</li>
                <li>• Real-time draft analyzer</li>
                <li>• Position-based strategies</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 card-hover">
              <h3 className="font-semibold text-gray-900 mb-3">Weekly Optimization</h3>
              <p className="text-gray-600 text-sm mb-4">Start/sit recommendations accounting for matchups, trends, injuries, and weather.</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Lineup optimizer</li>
                <li>• Matchup analysis</li>
                <li>• Injury impact assessment</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 card-hover">
              <h3 className="font-semibold text-gray-900 mb-3">Advanced Tools</h3>
              <p className="text-gray-600 text-sm mb-4">Trade analyzer, DFS optimization, and sophisticated evaluation beyond simple projections.</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Trade analyzer</li>
                <li>• DFS optimization</li>
                <li>• Advanced metrics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="subscribe" className="mt-24 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get the Winning Edge
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of fantasy managers who are already gaining an edge with Waiver Wire
          </p>
          <p className="text-lg mb-8 opacity-80">
            Subscribe today to unlock our full suite of tools and analysis, and position yourself for fantasy football dominance in 2025.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold shadow-lg glow-red">
              Subscribe Now
            </button>
          </div>
          <p className="text-sm mt-4 opacity-75">
            Early access available for subscribers who sign up before August
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 mt-16 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 Waiver Wire. All rights reserved. Launching for the 2025 Fantasy Football Season.</p>
        </div>
      </footer>
    </div>
  );
}
