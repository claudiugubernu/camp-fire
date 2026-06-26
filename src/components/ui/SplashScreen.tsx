import { motion } from 'framer-motion';

export function SplashScreen() {
  return (
    <div className='fixed inset-0 bg-surface-950 flex flex-col items-center justify-center gap-4'>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className='text-8xl animate-flicker'>
        🔥
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='text-2xl font-black gradient-fire tracking-tight'>
        Camp Fire
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className='flex gap-1.5 mt-2'>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className='w-2 h-2 rounded-full bg-fire-400'
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
