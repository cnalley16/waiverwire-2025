'use client'

import Image from "next/image";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authConfig);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Waiver Wire
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your Ultimate Fantasy Football Analysis Tool
          </p>
          <p className="text-lg text-gray-500 max-w-2xl">
            Get the competitive edge in fantasy football with our Assistant Coach. 
            Expert analysis, data-driven insights, and winning strategies for the 2025 season.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {session ? (
            <Link
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              href="/dashboard"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="/auth/signin"
              >
                Sign In
              </Link>
              <Link
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                href="/auth/signup"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Advanced Analytics</h3>
            <p className="text-gray-600">
              Machine learning-powered projections and risk analysis for every player.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Real-time Data</h3>
            <p className="text-gray-600">
              Stay updated with the latest injury reports, depth charts, and performance metrics.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Portfolio Optimization</h3>
            <p className="text-gray-600">
              Optimize your lineup and manage risk across your entire fantasy portfolio.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-lg mt-12 max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">🎯 Player Projections</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Multi-model ensemble forecasting</li>
                <li>• Matchup-specific adjustments</li>
                <li>• Weather and venue factors</li>
                <li>• Injury probability modeling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">📊 Risk Management</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Ceiling and floor projections</li>
                <li>• Correlation analysis</li>
                <li>• Portfolio diversification</li>
                <li>• Optimal lineup construction</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">🏆 League Management</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Custom scoring systems</li>
                <li>• Trade analysis and suggestions</li>
                <li>• Waiver wire recommendations</li>
                <li>• Season-long strategy planning</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">⚡ Real-time Updates</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Live injury alerts</li>
                <li>• Snap count tracking</li>
                <li>• Target share analysis</li>
                <li>• Depth chart changes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Ready to dominate your fantasy league?
          </p>
          {!session && (
            <Link
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 mx-auto w-fit"
              href="/auth/signup"
            >
              Get Started Today
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
