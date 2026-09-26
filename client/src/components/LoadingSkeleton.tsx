import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <div 
      className={cn("skeleton rounded-lg", className)}
      style={{
        animationDelay: animate ? `${Math.random() * 0.5}s` : '0s'
      }}
    />
  );
}

export function GameHeaderSkeleton() {
  return (
    <motion.div 
      className="glass rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-2 w-full rounded-full" />
    </motion.div>
  );
}

export function GameMenuSkeleton() {
  return (
    <motion.div 
      className="glass rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </motion.div>
  );
}

export function WordDisplaySkeleton() {
  return (
    <motion.div 
      className="text-center mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Skeleton className="h-16 w-48 mx-auto mb-4" />
      <Skeleton className="h-6 w-32 mx-auto" />
    </motion.div>
  );
}

export function PictureGridSkeleton() {
  return (
    <motion.div 
      className="grid grid-cols-2 gap-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={i}
          className="card-modern aspect-square p-8 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 0.4 + i * 0.1,
            type: "spring",
            stiffness: 200
          }}
        >
          <Skeleton className="h-16 w-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-20" />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function LetterGameSkeleton() {
  return (
    <motion.div 
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="text-center mb-8">
        <Skeleton className="h-20 w-64 mx-auto mb-4" />
        <Skeleton className="h-6 w-40 mx-auto" />
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton 
            key={i} 
            className="letter-card h-16 w-16 rounded-2xl"
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <Skeleton className="h-12 w-32 rounded-xl" />
      </div>
    </motion.div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <motion.div
      className={cn("inline-block", sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <svg
        className="w-full h-full text-primary"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

interface LoadingStateProps {
  type: 'header' | 'menu' | 'word' | 'pictures' | 'letters' | 'full';
  message?: string;
}

export function LoadingState({ type, message }: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'header':
        return <GameHeaderSkeleton />;
      case 'menu':
        return <GameMenuSkeleton />;
      case 'word':
        return <WordDisplaySkeleton />;
      case 'pictures':
        return <PictureGridSkeleton />;
      case 'letters':
        return <LetterGameSkeleton />;
      case 'full':
        return (
          <>
            <GameHeaderSkeleton />
            <GameMenuSkeleton />
            <WordDisplaySkeleton />
            <PictureGridSkeleton />
          </>
        );
      default:
        return (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderSkeleton()}
      {message && (
        <motion.p 
          className="text-center text-muted-foreground mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}