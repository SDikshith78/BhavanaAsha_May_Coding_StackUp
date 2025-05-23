import React, { useState } from "react";
import "../../lib/hamburgers.css";
import './CurveMenu.css'
import { AnimatePresence } from "framer-motion";
import CurveMenu from "./CurveMenu";


const SideNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <div className="burger-container">
      <button
        className={`hamburger hamburger--squeeze ${isOpen ? "is-active" : ""} `}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="hamburger-box cursor-pointer py-4">
          <span className="hamburger-inner"></span>
        </span>
      </button>
    </div>
    <AnimatePresence mode="wait">
        {isOpen && <CurveMenu onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default SideNavBar;
