// 간단한 아이콘 컴포넌트들
interface IconProps {
  className?: string;
}

export const Icons = {
  ArrowLeft: ({ className }: IconProps = {}) => (
    <span className={className || "text-xl"}>←</span>
  ),
  Play: ({ className }: IconProps = {}) => <span className={className}>▶</span>,
  Zap: ({ className }: IconProps = {}) => <span className={className}>⚡</span>,
  Clock: ({ className }: IconProps = {}) => (
    <span className={className}>⏱</span>
  ),
  TrendingUp: ({ className }: IconProps = {}) => (
    <span className={className}>📈</span>
  ),
  AlertCircle: ({ className }: IconProps = {}) => (
    <span className={className}>ℹ</span>
  ),
  TestTube: ({ className }: IconProps = {}) => (
    <span className={className}>🧪</span>
  ),
  Plus: ({ className }: IconProps = {}) => <span className={className}>+</span>,
  Trash2: ({ className }: IconProps = {}) => (
    <span className={className}>🗑</span>
  ),
  Settings: ({ className }: IconProps = {}) => (
    <span className={className}>⚙️</span>
  ),
  CheckCircle: ({ className }: IconProps = {}) => (
    <span className={className}>✅</span>
  ),
  XCircle: ({ className }: IconProps = {}) => (
    <span className={className}>❌</span>
  ),
  MessageSquare: ({ className }: IconProps = {}) => (
    <span className={className}>💬</span>
  ),
  Database: ({ className }: IconProps = {}) => (
    <span className={className}>🗄️</span>
  ),
  FileText: ({ className }: IconProps = {}) => (
    <span className={className}>📄</span>
  ),
  Activity: ({ className }: IconProps = {}) => (
    <span className={className}>📊</span>
  ),
  ArrowRight: ({ className }: IconProps = {}) => (
    <span className={className}>→</span>
  ),
  History: ({ className }: IconProps = {}) => (
    <span className={className}>📜</span>
  ),
  Lightbulb: ({ className }: IconProps = {}) => (
    <span className={className}>💡</span>
  ),
  Copy: ({ className }: IconProps = {}) => (
    <span className={className}>📋</span>
  ),
  Upload: ({ className }: IconProps = {}) => (
    <span className={className}>📤</span>
  ),
  Download: ({ className }: IconProps = {}) => (
    <span className={className}>📥</span>
  ),
  Search: ({ className }: IconProps = {}) => (
    <span className={className}>🔍</span>
  ),
  AlertTriangle: ({ className }: IconProps = {}) => (
    <span className={className}>⚠️</span>
  ),
  Filter: ({ className }: IconProps = {}) => (
    <span className={className}>🔽</span>
  ),
};

export default Icons;
