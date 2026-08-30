import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function AssistantButton({ onClick, hasUnread = false }: { onClick: () => void; hasUnread?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Open assistant"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      // bottom-20 clears the mobile bottom nav (md:hidden, ~64px tall); md:bottom-6
      // since desktop uses the top nav instead and has no bottom bar to avoid.
      className="fixed left-4 bottom-20 md:bottom-6 z-40 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570)', // Gemini's own brand gradient
        boxShadow: '0 8px 24px rgba(66,133,244,0.4)',
      }}
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles size={22} color="#fff" />
      </motion.div>
      {hasUnread && (
        <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
      )}
    </motion.button>
  );
}
