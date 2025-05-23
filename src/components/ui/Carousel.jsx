import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "./carousel.css";
import { supabase } from "../supabase/supabase";
import toast from "react-hot-toast";

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Carousel = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .not("url", "ilike", "%.mp4")
        .eq("is_ai_video", false)
        .order("created_at", { ascending: false })
        .limit(8); // Match original slides length

      if (error) {
        console.error("Supabase fetch error:", error);
        toast.error("Failed to fetch photos.");
        setLoading(false);
        return;
      }

      // Shuffle photos for random display on refresh
      const shuffledPhotos = shuffleArray(data);
      setPhotos(shuffledPhotos);
      setLoading(false);
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading...</div>;
  }

  if (!photos.length) {
    return <div className="text-center mt-10 text-white">No photos available.</div>;
  }

  return (
    <div className="bg-[#acf6d8] h-screen w-screen flex justify-center items-center">
      <div className="w-[80vw] h-[60vh] relative py-5">
        <Swiper
          className="h-[110%] relative top-[-20px] flex justify-center items-center"
          modules={[Navigation, Pagination, EffectCoverflow]}
          effect="coverflow"
          centeredSlides
          spaceBetween={2}
          slidesPerView={3}
          initialSlide={3}
          loop={true}
          autoplay={{
            delay: 1700,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,  
          }}
          navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}
          coverflowEffect={{ rotate: 0, stretch: 2, depth: 350, modifier: 1 }}
          pagination={{ clickable: true }}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {photos.map((photo) => (
            <SwiperSlide key={photo.id} className="flex justify-center items-center relative top-[45px]">
              <div className="relative w-[113%] left-[-32px] text-container">
                <img src={photo.url} alt="Photo" className="card" loading="lazy" />
                <div className="text-container-card">
                  {/* <h2 className="title">Photo</h2> */}
                  <p className="journal">{photo.journal || "No journal entry."}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="swiper-button-prev" />
      <div className="swiper-button-next" />
    </div>
  );
};

export default Carousel;