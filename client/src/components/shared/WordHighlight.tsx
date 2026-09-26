import { motion } from "framer-motion";

interface WordHighlightProps {
  word: string;
  className?: string;
}

export function WordHighlight({ word, className = "" }: WordHighlightProps) {
  return (
    <motion.div
      className={`text-4xl font-bold text-green-600 bg-green-100 rounded-lg py-3 px-6 inline-block ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: [1, 1.1, 1] }}
      transition={{ duration: 0.6 }}
    >
      {word}
    </motion.div>
  );
}