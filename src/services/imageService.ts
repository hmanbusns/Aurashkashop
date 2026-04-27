import axios from 'axios';

const IMGBB_API_KEY = "5fd2a4346ac2e5485a916a5d734d508b";

export const ImageUploadService = {
  async uploadToImgBB(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    return response.data.data.url;
  },

  async uploadToCloudinary(file: File): Promise<string> {
    const cloudName = "dzqnfaqzy";
    const apiKey = "988911776927922";
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    try {
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
      return response.data.secure_url;
    } catch (error) {
      console.warn("Cloudinary upload failed, trying ImgBB instead", error);
      return this.uploadToImgBB(file);
    }
  }
};
