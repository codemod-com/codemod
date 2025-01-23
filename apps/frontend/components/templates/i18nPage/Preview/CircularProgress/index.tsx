import { motion } from "framer-motion";

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  percentage: number;
  className?: string;
}

const CircularProgress = ({
  size,
  strokeWidth,
  percentage,
  className = "text-lime-500 dark:text-accent",
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{
            strokeDashoffset:
              circumference - (percentage / 100) * circumference,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          className={className}
        />
      </svg>
    </div>
  );
};

export default CircularProgress;
