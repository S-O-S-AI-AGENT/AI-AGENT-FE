"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/Icons";

interface HistoryItem {
  question: string;
  sql: string;
}

export default function Text2SQL() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("text2sql-dark-mode");
    if (saved) {
      setIsDarkMode(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("text2sql-dark-mode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  const [question, setQuestion] = useState("");
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tableSchema, setTableSchema] = useState(`-- 예시 테이블 스키마
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP,
  status VARCHAR(20)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  product_name VARCHAR(100),
  price DECIMAL(10,2),
  order_date TIMESTAMP,
  status VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10,2),
  stock_quantity INT
);`);

  const [history, setHistory] = useState([
    {
      question: "지난 달에 가장 많이 주문한 사용자를 찾아주세요",
      sql: "SELECT u.name, COUNT(o.id) as order_count FROM users u JOIN orders o ON u.id = o.user_id WHERE o.order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH) GROUP BY u.id, u.name ORDER BY order_count DESC LIMIT 1;",
    },
    {
      question: "활성 사용자들의 평균 주문 금액은?",
      sql: "SELECT AVG(o.price) as avg_order_amount FROM orders o JOIN users u ON o.user_id = u.id WHERE u.status = 'active';",
    },
  ]);

  const suggestions = [
    "지난 주에 주문한 고객들의 목록을 보여주세요",
    "가장 인기 있는 상품 카테고리는 무엇인가요?",
    "이번 달 총 매출은 얼마인가요?",
    "재고가 10개 미만인 상품들을 찾아주세요",
    "신규 가입자 중 첫 주문을 한 고객 비율은?",
    "평균 주문 금액이 가장 높은 상위 10명의 고객은?",
  ];

  const handleGenerate = async () => {
    if (!question.trim()) return;

    setIsGenerating(true);

    // AI API 호출 시뮬레이션
    setTimeout(() => {
      let mockSQL = "";

      if (question.includes("매출") || question.includes("총액")) {
        mockSQL = `-- ${question}
SELECT 
    SUM(price) as total_revenue,
    COUNT(*) as total_orders
FROM orders 
WHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'completed';`;
      } else if (question.includes("고객") || question.includes("사용자")) {
        mockSQL = `-- ${question}
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.price) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;`;
      } else if (question.includes("상품") || question.includes("제품")) {
        mockSQL = `-- ${question}
SELECT 
    p.name,
    p.category,
    p.price,
    p.stock_quantity,
    COUNT(o.id) as order_count
FROM products p
LEFT JOIN orders o ON p.name = o.product_name
GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity
ORDER BY order_count DESC;`;
      } else {
        mockSQL = `-- ${question}
SELECT *
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY u.created_at DESC;`;
      }

      setGeneratedSQL(mockSQL);

      // 히스토리에 추가
      const newHistoryItem = {
        question: question,
        sql: mockSQL,
      };
      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // 최대 10개 유지

      setIsGenerating(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };
  const handleHistoryClick = (item: HistoryItem) => {
    setQuestion(item.question);
    setGeneratedSQL(item.sql);
  };
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900 text-white"
          : "bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 text-gray-900"
      }`}
    >
      {/* Enhanced Header */}
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
                <Icons.ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <Icons.MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Text2SQL
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    자연어를 SQL로 변환
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            {" "}
            <h2
              className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-slate-100" : "text-slate-900"
              }`}
            >
              자연어로 SQL 쿼리 생성
            </h2>
            <p
              className={`${isDarkMode ? "text-slate-400" : "text-slate-700"}`}
            >
              평소 말하듯이 질문하면 AI가 적절한 SQL 쿼리를 생성해드립니다.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* 메인 입력 영역 */}
            <div className="lg:col-span-3 space-y-6">
              {" "}
              {/* 스키마 입력 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Icons.Database className="h-5 w-5" />
                  데이터베이스 스키마
                </h3>
                <textarea
                  value={tableSchema}
                  onChange={(e) => setTableSchema(e.target.value)}
                  className={`w-full h-48 p-4 font-mono text-sm rounded border resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode
                      ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400"
                      : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                  }`}
                  placeholder="테이블 스키마를 입력하세요..."
                />
              </div>{" "}
              {/* 질문 입력 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Icons.MessageSquare className="h-5 w-5" />
                  질문하기
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="예: 지난 달에 가장 많이 주문한 고객은 누구인가요?"
                    className={`w-full h-24 p-4 rounded border resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode
                        ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400"
                        : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">
                      {question.length} 문자
                    </span>
                    <button
                      onClick={handleGenerate}
                      disabled={!question.trim() || isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Icons.Play className="h-4 w-4" />
                          SQL 생성
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>{" "}
              {/* 생성된 SQL */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    생성된 SQL 쿼리
                  </h3>
                  {generatedSQL && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(generatedSQL)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      {" "}
                      <Icons.Copy className="h-4 w-4" />
                      복사
                    </button>
                  )}
                </div>{" "}
                <textarea
                  value={generatedSQL}
                  readOnly
                  placeholder="생성된 SQL 쿼리가 여기에 표시됩니다..."
                  className={`w-full h-64 p-4 font-mono text-sm rounded border resize-none ${
                    isDarkMode
                      ? "bg-slate-900 text-white border-slate-700 placeholder-slate-400"
                      : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-500"
                  }`}
                />
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {" "}
              {/* 제안 질문 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h4
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Icons.Lightbulb className="h-5 w-5 text-yellow-500" />
                  제안 질문
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left p-3 text-sm rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 hover:bg-purple-900/20 text-slate-300"
                          : "bg-slate-50 hover:bg-purple-50 text-slate-700"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>{" "}
              {/* 최근 질문 */}
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  isDarkMode ? "bg-slate-800" : "bg-white"
                }`}
              >
                <h4
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  <Icons.History className="h-5 w-5 text-blue-500" />
                  최근 질문
                </h4>
                <div className="space-y-3">
                  {history.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isDarkMode
                          ? "bg-slate-700 hover:bg-blue-900/20"
                          : "bg-slate-50 hover:bg-blue-50"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 truncate ${
                          isDarkMode ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {item.question}
                      </div>
                      <div
                        className={`text-xs font-mono truncate ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.sql.split("\n")[1] || item.sql.substring(0, 50)}
                        ...
                      </div>
                    </button>
                  ))}
                </div>
              </div>{" "}
              {/* 팁 */}
              <div
                className={`rounded-lg p-6 ${
                  isDarkMode ? "bg-purple-900/20" : "bg-purple-50"
                }`}
              >
                <h5
                  className={`font-semibold mb-2 ${
                    isDarkMode ? "text-purple-100" : "text-purple-900"
                  }`}
                >
                  💡 사용 팁
                </h5>
                <ul
                  className={`text-sm space-y-1 ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  <li>• 구체적인 질문을 해주세요</li>
                  <li>• 테이블명과 컬럼명을 포함하면 더 정확합니다</li>
                  <li>• 기간이나 조건을 명시해주세요</li>
                  <li>• 복잡한 질문은 단계별로 나누어 질문하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
