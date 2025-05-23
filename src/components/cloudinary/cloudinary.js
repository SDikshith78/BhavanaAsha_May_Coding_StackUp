// src/cloudinary.js
import { Cloudinary } from "cloudinary-core";

const cloudinary = new Cloudinary({
  cloud_name: "sdikshith", // Replace with your Cloud Name from the Dashboard
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,// Replace with your API Key
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET, // Replace with your API Secret
  secure: true,
});

export default cloudinary;

