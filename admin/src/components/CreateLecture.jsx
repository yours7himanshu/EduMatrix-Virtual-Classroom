/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import { useState } from "react";
import { createLecture } from "../api/lectureApi";
import socket from "../socket";

const CreateLecture = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateLecture = async () => {
        const newLecture = await createLecture({ title, description, host: "Admin" });
        if (newLecture) {
            socket.emit("joinLecture", newLecture._id); 
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Create New Lecture</h2>
            <div>
                <label htmlFor="lectureTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Lecture Title
                </label>
                <input
                    id="lectureTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter lecture title"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label htmlFor="lectureDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Lecture Description
                </label>
                <input
                    id="lectureDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter lecture description"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                onClick={handleCreateLecture}
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
                Create Lecture
            </button>
        </div>
    );
};

export default CreateLecture;
