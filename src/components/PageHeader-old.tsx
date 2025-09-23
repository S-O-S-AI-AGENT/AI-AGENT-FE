import Link from "next/link";
import { Icons } from "./Icons";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backHref?: string;
  iconBgColor: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function PageHeader({
  title,
  description,
  icon,
  backHref = "/",
  iconBgColor,
  isDarkMode = false,
  onToggleDarkMode,
}: PageHeaderProps) {
  return (
    <header className={`border-b backdrop-blur-xl transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/80 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icons.ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-3">
              <div className={`${iconBgColor} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-4">
        <div className="ml-14">
          <p className="text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </header>
  );
}
