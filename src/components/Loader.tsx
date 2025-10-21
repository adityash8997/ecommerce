import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "../App.css";

export default function Loader({ loading }: { loading: boolean }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="book-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="book">
            <div className="page"><h1>Kiit Sathi</h1></div>
            <div className="page"><h1>Kiit Sathi</h1></div>
            <div className="page"><h1>Kiit Sathi</h1></div>
            <div className="page"><h1>Kiit Sathi</h1></div>
            <div className="page"><h1>Kiit Sathi</h1></div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
