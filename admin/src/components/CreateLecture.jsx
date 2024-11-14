import { useState } from "react";
import { createLecture } from "../api/lectureApi";
import socket from "../socket";

const CreateLecture = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateLecture = async () => {
        const newLecture = await createLecture({ title, description, host: "Admin" });
        if (newLecture) {
            socket.emit("joinLecture", newLecture._id); // Admin joins the lecture room
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
