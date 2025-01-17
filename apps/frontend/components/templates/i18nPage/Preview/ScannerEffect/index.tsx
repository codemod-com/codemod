import { motion } from "framer-motion";
import { memo } from "react";

const Scanner = ({ onComplete }: { onComplete?: () => void }) => {
  return (
    <motion.div
      className="absolute top-0 z-30 m-auto h-full w-px bg-gradient-to-b from-transparent from-[5%] via-lime-500 to-transparent to-[95%]"
      style={{
        top: "0",
        zIndex: 40,
      }}
      initial={{ right: "100%" }} // Start 100% to the right of the container
      animate={{ right: "-20%" }} // End slightly outside the right boundary
      exit={{ opacity: 0 }}
      transition={{
        right: { type: "spring", stiffness: 40, damping: 20 }, // Smooth spring transition
        opacity: { duration: 0, ease: "easeOut" }, // Gradual fade-out
      }}
      onAnimationComplete={onComplete} // Callback when animation is complete
    >
      {/* Outer glow gradient */}
      <div className="absolute left-0 top-1/2 z-20 h-full w-36 -translate-y-1/2 bg-gradient-to-r from-lime-400 via-transparent to-transparent opacity-50 [mask-image:radial-gradient(100px_at_left,white,transparent)]" />

      {/* Inner gradient effect */}
      <div className="absolute left-0 top-1/2 z-10 h-1/2 w-10 -translate-y-1/2 bg-gradient-to-r from-lime-400 via-transparent to-transparent opacity-100 [mask-image:radial-gradient(50px_at_left,white,transparent)]" />

      {/* Trail effect */}
      <div className="absolute -right-10 top-1/2 h-3/4 w-10 -translate-y-1/2 [mask-image:radial-gradient(100px_at_left,white,transparent)]" />
    </motion.div>
  );
};

export default memo(Scanner);
