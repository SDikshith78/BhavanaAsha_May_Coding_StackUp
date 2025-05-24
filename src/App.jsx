import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navigation from "./pages/Navigation";
import Upload from "./pages/Upload";
import UploadedPosts from "./components/ui/UploadedPosts";
import Photos from "./pages/Photos";
import Videos from "./pages/Videos";
import AIVideoEdit from "./pages/AIVideoEdit";
import { Toaster } from "react-hot-toast";
import { supabase } from "./components/supabase/supabase";

export default function App() {
  const [session, setSession] = useState(null);
  // const [isLoading, setIsLoading] = useState(!sessionStorage.getItem("hasLoaded"));

  // console.log("App render, isLoading:", isLoading, "hasLoaded:", sessionStorage.getItem("hasLoaded"));

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     console.log("Supabase session:", session);
  //     setSession(session);
  //     if (isLoading) {
  //       setTimeout(() => {
  //         console.log("Hiding Loader");
  //         setIsLoading(false);
  //         sessionStorage.setItem("hasLoaded", "true");
  //       }, 5000); // 5 seconds
  //     }
  //   });

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     (_event, session) => {
  //       setSession(session);
  //     }
  //   );

  //   return () => subscription.unsubscribe();
  // }, [isLoading]);

  // if (isLoading) {
  //   return (
  //     <div className="fixed top-0 left-0 h-screen w-screen z-50">
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
    <Router>
      <div className="overflow-hidden">
        <div className="fixed top-4 left-6 z-50">
          <img
            src="/assets/logo/Bhavana_Asha_logo.png"
            alt="Logo"
            className="w-25 h-auto"
          />
        </div>

        <Toaster position="top-right" reverseOrder={false} />
        <div className="relative z-10">
          <Navigation session={session} />
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HomePage />
                <Upload />
                <UploadedPosts />
              </>
            }
          />
          <Route path="/photos" element={<Photos />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/ai-video-edit" element={<AIVideoEdit />} />
          <Route path="/post/:id" element={<UploadedPosts />} />
        </Routes>
      </div>
    </Router>
  );
}
