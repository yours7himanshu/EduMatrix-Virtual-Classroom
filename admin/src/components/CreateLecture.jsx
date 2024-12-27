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
        <div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <button onClick={handleCreateLecture}>Create Lecture</button>
        </div>
    );
};

export default CreateLecture;
