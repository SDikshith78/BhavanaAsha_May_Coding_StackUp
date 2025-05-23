// E:\bhavana-asha\src\CurveMenu.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase/supabase";
import toast from "react-hot-toast";
import { menuSlide } from "./anim";
import Curve from "./Curve";

const navItems = ["Posts", "Favorites", "Camera"];

const CurveMenu = ({ onClose, session }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session) setUser(session.user);
    else setUser(null);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [session]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out!");
      onClose();
    }
  };

  return (
    <motion.div
      className="menu"
      variants={menuSlide}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Curve />
      <div className="menu-content">
        <div className="nav">
          <div className="nav-header">Navigation</div>
          {navItems.map((item, index) => (
            <a key={index} href="#" onClick={onClose}>
              {item}
            </a>
          ))}
          {user ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
              className="sign-out"
            >
              Sign Out
            </a>
          ) : (
            <Link to="/auth" onClick={onClose} className="sign-in">
              Sign In
            </Link>
          )}
        </div>
        <div className="footer">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">Dribbble</a>
        </div>
      </div>
    </motion.div>
  );
};

export default CurveMenu;