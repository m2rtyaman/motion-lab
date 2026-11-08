import { useState, type FC } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, ArrowRight, Play, CheckCircle2, Shield, RefreshCw } from "lucide-react";
import { SPRING, PALETTE } from "../../../../src/core/tokens";

interface InteractiveActionCardProps {
  title?: string;
  subtitle?: string;
}

/**
 * Gold Standard Example 2: Anti-Slop Industrial Spring Card
 * Zero neon glow, zero bounce overshoot, capillary 1px borders, and font-mono hierarchy.
 */
export const InteractiveActionCard: FC<InteractiveActionCardProps> = ({
  title = "Deploy Pipeline",
  subtitle = "Production Cluster #09",
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...SPRING.snappy,
        staggerChildren: 0.04,
        delayChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: SPRING.snappy,
    },
  };

  const handleAction = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsCompleted(false);
  };

  return (
    <div
      className="relative flex items-center justify-center w-full h-full p-8 select-none"
      style={{ backgroundColor: PALETTE.bgBase }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          scale: 1.01,
          borderColor: PALETTE.borderFocus,
          transition: SPRING.rigid,
        }}
        whileTap={{ scale: 0.99, transition: SPRING.rigid }}
        className="relative w-full max-w-sm rounded-xl bg-[#121215] border border-white/[0.06] p-6 overflow-hidden cursor-default"
      >
        {/* Top Micro Label & Status */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-[#18181b] border border-white/[0.06] text-zinc-300">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
              CI/CD PIPELINE
            </span>
          </div>

          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#18181b] border border-white/[0.08] text-zinc-300"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: isCompleted
                  ? PALETTE.semanticSuccess
                  : isRunning
                  ? PALETTE.semanticWarn
                  : PALETTE.textMuted,
              }}
            />
            <span>{isCompleted ? "DEPLOYED" : isRunning ? "RUNNING" : "IDLE"}</span>
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.div variants={itemVariants} className="space-y-1 mb-5">
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight">{title}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{subtitle}</p>
        </motion.div>

        {/* Telemetry Metadata */}
        <motion.div
          variants={itemVariants}
          className="p-3 rounded-md bg-[#09090b] border border-white/[0.06] mb-5 flex items-center justify-between text-[11px] font-mono"
        >
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-zinc-500" />
            <span>ZERO-SLOP SANDBOX</span>
          </div>
          <span className="text-zinc-500">v2.4.0</span>
        </motion.div>

        {/* Action Controls */}
        <motion.div variants={itemVariants} className="flex items-center gap-2.5">
          <motion.button
            onClick={handleAction}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={SPRING.rigid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer bg-zinc-100 text-zinc-950 hover:bg-white transition-colors"
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={SPRING.rigid}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>EXECUTING</span>
                </motion.span>
              ) : isCompleted ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={SPRING.rigid}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={SPRING.rigid}
                  className="flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>TRIGGER</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => {
              setIsRunning(false);
              setIsCompleted(true);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING.rigid}
            className="p-2.5 rounded-md bg-[#18181b] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Onayla"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InteractiveActionCard;
