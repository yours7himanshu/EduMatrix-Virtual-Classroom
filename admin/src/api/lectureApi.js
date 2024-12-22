// src/api/lectureApi.js

// Copyright (c) 2024 Himanshu Dinkar
// Licensed under the MIT License. See LICENSE file in the project root for full license information.


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
