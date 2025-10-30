"use client";

import { useEffect } from "react";

export default function SQLTuner() {
  useEffect(() => {
    // 즉시 외부 SQL 튜너로 리다이렉트
    window.location.href = "http://vaatz-tuner-vaatz-tuner--20e49-112305685-f25b4e832f9a.kr.lb.naverncp.com/dashboard";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-xl text-gray-700 font-semibold">SQL 튜너로 이동 중...</p>
        <p className="text-sm text-gray-500 mt-2">
          자동으로 이동하지 않으면{" "}
          <a
            href="http://vaatz-tuner-vaatz-tuner--20e49-112305685-f25b4e832f9a.kr.lb.naverncp.com/dashboard"
            className="text-indigo-600 underline hover:text-indigo-800"
          >
            여기를 클릭
          </a>
          하세요.
        </p>
      </div>
    </div>
  );
}
