"use client";

import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: string;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  storageKey: string;
}

export default function PageHeader({
  title,
  description,
  icon,
  isDarkMode,
  setIsDarkMode,
}: PageHeaderProps) {
  return (
    <header
      className={`border-b backdrop-blur-xl transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900/80 border-gray-700"
          : "bg-white/80 border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              ← 홈으로
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">{icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </header>
  );
}
