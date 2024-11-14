// src/api/lectureApi.js
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/lectures`;

// Create a lecture
export const createLecture = async (lectureData) => {
    try {
        const response = await axios.post(API_URL, lectureData);
        return response.data;
    } catch (error) {
        console.error("Error creating lecture:", error);
    }
};
