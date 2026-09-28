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

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Room,
  RoomEvent,
  Track,
  createLocalVideoTrack,
} from "livekit-client";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import Message from "../shared/Message";
import TabMonitor from "./TabMonitor/TabMonitor";

// Icons
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  Users,
  PhoneOff,
  Radio,
  RefreshCw,
  Plus,
  BookOpen,
  X,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Wifi,
  MessageSquare,
} from "lucide-react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ─── Track Renderer ─────────────────────────────────────────────────── */
const LiveKitTrackRenderer = ({
  track,
  isLocal = false,
  className = "w-full h-full object-cover",
  onMetadataLoaded,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={className}
      onLoadedMetadata={onMetadataLoaded}
    />
  );
};

/* ─── Avatar helper ─────────────────────────────────────────────────── */
const Avatar = ({ name, size = "md" }) => {
  const initials = (name || "ST").slice(0, 2).toUpperCase();
  const sizeMap = {
    sm: "w-10 h-10 text-xs",
    md: "w-16 h-16 text-base",
    lg: "w-24 h-24 text-2xl",
  };
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
  ];
  const colorIdx = (name || "").charCodeAt(0) % colors.length;
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}
    >
      {initials}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
const AdminLive = () => {
  const { roomId, classroomId: paramClassroomId } = useParams();
  const navigate = useNavigate();

  const isValidObjectId = (id) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  // Classrooms & Session State
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    isValidObjectId(paramClassroomId)
      ? paramClassroomId
      : isValidObjectId(roomId)
      ? roomId
      : ""
  );
  const [activeSession, setActiveSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Classroom Creation Modal State
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [newClassTitle, setNewClassTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newBranch, setNewBranch] = useState("CSE");
  const [newBatch, setNewBatch] = useState("2026");
  const [newDescription, setNewDescription] = useState("");
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false);
  const [createClassError, setCreateClassError] = useState("");

  // Roster & Enrollment
  const [showRoster, setShowRoster] = useState(false);
  const [roster, setRoster] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [enrollInput, setEnrollInput] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [rosterError, setRosterError] = useState("");
  const [rosterSuccess, setRosterSuccess] = useState("");

  // LiveKit Connection State
  const [room, setRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // Media Track States
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localScreenTrack, setLocalScreenTrack] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Remote Participants Map
  const [remoteParticipants, setRemoteParticipants] = useState(new Map());

  // In-Call Chat Drawer State
  const [showChat, setShowChat] = useState(false);

  // Blazeface Face Detection
  const [alertMsg, setAlertMsg] = useState("");
  const localVideoRef = useRef(null);
  const modelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const isDetectionRunningRef = useRef(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        token: token || "",
      },
      withCredentials: true,
    };
  };

  // 1. Fetch teacher classrooms
  useEffect(() => {
    const fetchTeacherClassrooms = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/classrooms`, getAuthHeaders());
        if (res.data?.success && Array.isArray(res.data.classrooms)) {
          setClassrooms(res.data.classrooms);
          setSelectedClassroomId((prev) =>
            isValidObjectId(prev) && res.data.classrooms.some((c) => c._id === prev)
              ? prev
              : res.data.classrooms[0]?._id || ""
          );
        }
      } catch (err) {
        console.warn("Could not fetch classrooms list:", err.message);
      }
    };
    fetchTeacherClassrooms();
  }, []);

  const handleCreateClassroom = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newClassTitle.trim() || !newCourseCode.trim()) {
      setCreateClassError("Classroom title and course code are required");
      return;
    }
    setIsCreatingClassroom(true);
    setCreateClassError("");
    try {
      const res = await axios.post(
        `${backendUrl}/api/classrooms`,
        {
          title: newClassTitle.trim(),
          courseCode: newCourseCode.trim(),
          branch: newBranch.trim() || "CSE",
          batch: newBatch.trim() || "2026",
          description: newDescription.trim(),
        },
        getAuthHeaders()
      );
      if (res.data?.success && res.data.classroom) {
        const created = res.data.classroom;
        setClassrooms((prev) => [...prev, created]);
        setSelectedClassroomId(created._id);
        setShowCreateClassroom(false);
        setNewClassTitle("");
        setNewCourseCode("");
        setNewDescription("");
      }
    } catch (err) {
      setCreateClassError(
        err.response?.data?.message || err.message || "Failed to create classroom"
      );
    } finally {
      setIsCreatingClassroom(false);
    }
  };

  const fetchRoster = useCallback(async () => {
    if (!isValidObjectId(selectedClassroomId)) return;
    setIsLoadingRoster(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/enrollments`,
        getAuthHeaders()
      );
      if (res.data?.success && Array.isArray(res.data.roster)) {
        setRoster(res.data.roster);
      }
    } catch (err) {
      console.warn("Could not fetch roster:", err.message);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handleEnrollStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!enrollInput.trim() || !isValidObjectId(selectedClassroomId)) return;
    setIsEnrolling(true);
    setRosterError("");
    setRosterSuccess("");
    try {
      const isNum = /^\d+$/.test(enrollInput.trim());
      const payload = isNum
        ? { rollNo: enrollInput.trim() }
        : { email: enrollInput.trim().toLowerCase() };
      const res = await axios.post(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/enrollments`,
        payload,
        getAuthHeaders()
      );
      if (res.data?.success) {
        setRosterSuccess(res.data.message || "Student enrolled successfully!");
        setEnrollInput("");
        fetchRoster();
      }
    } catch (err) {
      setRosterError(
        err.response?.data?.message || err.message || "Failed to enroll student"
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleToggleEnrollmentStatus = async (studentId, currentStatus) => {
    const newStatus = currentStatus === "enrolled" ? "dropped" : "enrolled";
    setRosterError("");
    setRosterSuccess("");
    try {
      const res = await axios.patch(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/enrollments/${studentId}`,
        { status: newStatus },
        getAuthHeaders()
      );
      if (res.data?.success) {
        setRosterSuccess(`Student marked as ${newStatus}`);
        fetchRoster();
      }
    } catch (err) {
      setRosterError(err.response?.data?.message || "Failed to update enrollment");
    }
  };

  const checkActiveSession = useCallback(async () => {
    if (!isValidObjectId(selectedClassroomId)) return;
    setIsLoadingSession(true);
    try {
      const res = await axios.get(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/sessions/active`,
        getAuthHeaders()
      );
      if (res.data?.success) {
        setActiveSession(res.data.session || null);
      }
    } catch (err) {
      console.warn("Error checking active session:", err.response?.data?.message || err.message);
      setActiveSession(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  const handleStartSession = async () => {
    if (!isValidObjectId(selectedClassroomId)) {
      setConnectionError("Please select or create a valid classroom before starting a live session");
      return;
    }
    setIsStartingSession(true);
    setConnectionError("");
    try {
      const res = await axios.post(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/sessions`,
        { title: "Live Lecture" },
        getAuthHeaders()
      );
      if (res.data?.success && res.data.session) {
        setActiveSession(res.data.session);
      }
    } catch (err) {
      setConnectionError(err.response?.data?.message || "Failed to start live session");
    } finally {
      setIsStartingSession(false);
    }
  };

  const connectToLiveKit = useCallback(async () => {
    if (!isValidObjectId(selectedClassroomId)) {
      setConnectionError("Please select or create a valid classroom first");
      return;
    }
    setIsConnecting(true);
    setConnectionError("");
    try {
      const tokenRes = await axios.post(
        `${backendUrl}/api/live/token`,
        { classroomId: selectedClassroomId },
        getAuthHeaders()
      );
      if (!tokenRes.data?.success || !tokenRes.data.token) {
        throw new Error(tokenRes.data?.message || "Failed to acquire live token");
      }
      const { token, livekitUrl } = tokenRes.data;

      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: { simulcast: true },
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          track.attach();
        }
        setRemoteParticipants((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(participant.identity) || { participant };
          if (track.kind === Track.Kind.Video) existing.videoTrack = track;
          else if (track.kind === Track.Kind.Audio) existing.audioTrack = track;
          updated.set(participant.identity, existing);
          return updated;
        });
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach();
        }
        setRemoteParticipants((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(participant.identity);
          if (existing) {
            if (track.kind === Track.Kind.Video) existing.videoTrack = null;
            if (track.kind === Track.Kind.Audio) existing.audioTrack = null;
            if (!existing.videoTrack && !existing.audioTrack) updated.delete(participant.identity);
            else updated.set(participant.identity, existing);
          }
          return updated;
        });
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setRemoteParticipants((prev) => {
          const updated = new Map(prev);
          updated.delete(participant.identity);
          return updated;
        });
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setRoom(null);
        setRemoteParticipants(new Map());
      });

      await newRoom.connect(livekitUrl, token);

      try {
        await newRoom.localParticipant.enableCameraAndMicrophone();
        const videoPub = Array.from(newRoom.localParticipant.videoTrackPublications.values())[0];
        const audioPub = Array.from(newRoom.localParticipant.audioTrackPublications.values())[0];
        if (videoPub?.track) setLocalVideoTrack(videoPub.track);
        if (audioPub?.track) setLocalAudioTrack(audioPub.track);
      } catch (mediaErr) {
        console.warn("Camera/microphone error during publish:", mediaErr);
        setAlertMsg("Error accessing camera or microphone. Please check permissions.");
      }

      setRoom(newRoom);
      setIsConnected(true);
    } catch (err) {
      console.error("LiveKit connection error:", err);
      setConnectionError(
        err.response?.data?.message || err.message || "Failed to connect to live lecture"
      );
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    if (activeSession && !isConnected && !isConnecting && !room) {
      connectToLiveKit();
    }
  }, [activeSession, isConnected, isConnecting, room, connectToLiveKit]);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const toggleMicrophone = async () => {
    if (!room) return;
    try {
      const nextState = !isMicEnabled;
      await room.localParticipant.setMicrophoneEnabled(nextState);
      setIsMicEnabled(nextState);
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  };

  const toggleCamera = async () => {
    if (!room) return;
    try {
      const nextState = !isCameraEnabled;
      await room.localParticipant.setCameraEnabled(nextState);
      setIsCameraEnabled(nextState);
      const videoPub = Array.from(room.localParticipant.videoTrackPublications.values())[0];
      setLocalVideoTrack(nextState ? videoPub?.track : null);
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  const toggleScreenShare = async () => {
    if (!room) return;
    try {
      const nextState = !isScreenSharing;
      await room.localParticipant.setScreenShareEnabled(nextState);
      setIsScreenSharing(nextState);
      const screenPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(
        (pub) => pub.source === Track.Source.ScreenShare
      );
      setLocalScreenTrack(nextState ? screenPub?.track : null);
    } catch (err) {
      console.error("Failed to toggle screen share:", err);
      setIsScreenSharing(false);
    }
  };

  const handleEndLecture = async () => {
    if (activeSession && selectedClassroomId) {
      try {
        await axios.post(
          `${backendUrl}/api/classrooms/${selectedClassroomId}/sessions/${activeSession._id}/end`,
          {},
          getAuthHeaders()
        );
      } catch (err) {
        console.warn("Error recording session termination:", err);
      }
    }
    if (room) {
      room.disconnect();
    }
    setActiveSession(null);
    setIsConnected(false);
    navigate("/dashboard");
  };

  // Blazeface
  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        const loadedModel = await blazeface.load();
        if (isMounted) {
          modelRef.current = loadedModel;
        }
      } catch (error) {
        console.warn("Blazeface model failed to load:", error);
      }
    };
    loadModel();
    return () => {
      isMounted = false;
    };
  }, []);

  const detectFaceLoop = useCallback(async () => {
    if (!localVideoRef.current || !modelRef.current || !isDetectionRunningRef.current) return;
    const videoElement = localVideoRef.current;
    if (videoElement.readyState < videoElement.HAVE_METADATA) {
      detectionIntervalRef.current = requestAnimationFrame(detectFaceLoop);
      return;
    }
    try {
      const predictions = await modelRef.current.estimateFaces(videoElement, false);
      if (predictions.length === 0) {
        setAlertMsg("No face detected! Please ensure you are facing the camera.");
      } else if (predictions.length > 1) {
        setAlertMsg("Multiple faces detected in the teacher frame.");
      } else {
        setAlertMsg("");
      }
    } catch (error) {
      // Silent catch
    } finally {
      if (isDetectionRunningRef.current) {
        detectionIntervalRef.current = requestAnimationFrame(detectFaceLoop);
      }
    }
  }, []);

  const handleLocalVideoMetadataLoaded = () => {
    if (modelRef.current && !isDetectionRunningRef.current) {
      isDetectionRunningRef.current = true;
      detectFaceLoop();
    }
  };

  useEffect(() => {
    return () => {
      isDetectionRunningRef.current = false;
      if (detectionIntervalRef.current) {
        cancelAnimationFrame(detectionIntervalRef.current);
      }
    };
  }, []);

  const participantsList = Array.from(remoteParticipants.values());
  const selectedClassroom = classrooms.find((c) => c._id === selectedClassroomId);

  // ── Dynamic Grid Calculation ───────────────────────────────────────
  // Total participants in grid = Teacher (1) + remote students
  const totalInGrid = 1 + participantsList.length;

  const getDynamicGridClass = (count) => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-rows-1";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  /* ─── JSX ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex min-h-screen w-full flex-col text-white antialiased overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1229 50%, #0a0f1e 100%)" }}
    >
      {/* ── Top Header Bar ───────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 w-full px-5 py-3 flex items-center justify-between gap-3 border-b z-20"
        style={{
          background: "rgba(13,18,41,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(99,102,241,0.18)",
          boxShadow: "0 1px 0 rgba(99,102,241,0.08)",
        }}
      >
        {/* Left: Brand + Classroom selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>

          <div
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-400"
              style={{ animation: "pulse 1.5s infinite" }}
            />
            LIVE
          </div>

          {/* Classroom selector */}
          <div className="relative flex-shrink-0">
            {classrooms.length > 0 ? (
              <select
                value={selectedClassroomId}
                onChange={(e) => {
                  if (room) room.disconnect();
                  setSelectedClassroomId(e.target.value);
                }}
                disabled={isConnected}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold text-white focus:outline-none cursor-pointer"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                }}
              >
                {classrooms.map((c) => (
                  <option key={c._id} value={c._id} style={{ background: "#0d1229" }}>
                    {c.courseCode ? `${c.courseCode} — ` : ""}{c.title}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#fbbf24",
                }}
              >
                No Classrooms Yet
              </span>
            )}
          </div>

          {/* Action buttons */}
          <button
            type="button"
            onClick={() => setShowCreateClassroom(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            title="Create a new Classroom"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Class</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowRoster(true);
              fetchRoster();
            }}
            disabled={!isValidObjectId(selectedClassroomId)}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
            title="Classroom Roster & Enroll Students"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Roster</span>
            {roster.filter((r) => r.status === "enrolled").length > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(99,102,241,0.3)" }}
              >
                {roster.filter((r) => r.status === "enrolled").length}
              </span>
            )}
          </button>

          {activeSession && (
            <span
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#34d399",
              }}
            >
              <Wifi className="w-3 h-3" />
              {activeSession.title || "Session Active"}
            </span>
          )}
        </div>

        {/* Right: Alert + Connected Count + Chat Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {alertMsg && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#fbbf24",
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="max-w-[200px] truncate">{alertMsg}</span>
            </div>
          )}

          {isConnected && (
            <div
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{participantsList.length} joined</span>
            </div>
          )}

          {/* Chat Toggle in Header */}
          <button
            type="button"
            onClick={() => setShowChat((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: showChat
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(99,102,241,0.15)",
              border: showChat
                ? "1px solid rgba(139,92,246,0.5)"
                : "1px solid rgba(99,102,241,0.25)",
              color: "white",
            }}
            title="Toggle In-Call Chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showChat ? "Close Chat" : "Chat"}</span>
          </button>
        </div>
      </header>

      <TabMonitor />

      {/* Alert banner for mobile */}
      {alertMsg && (
        <div
          className="flex-shrink-0 flex md:hidden items-center gap-2 px-4 py-2 text-xs font-semibold"
          style={{
            background: "rgba(245,158,11,0.1)",
            borderBottom: "1px solid rgba(245,158,11,0.2)",
            color: "#fbbf24",
          }}
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {alertMsg}
        </div>
      )}

      {/* ── Main Classroom View ───────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden min-h-0 relative">
        {/* Session Lifecycle Callout if Session is not active */}
        {!activeSession && !isLoadingSession ? (
          <div className="my-auto flex items-center justify-center">
            <div
              className="w-full max-w-lg rounded-2xl p-8 text-center space-y-5 shadow-2xl"
              style={{
                background: "rgba(13,18,41,0.95)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {classrooms.length === 0 ? "No Classroom Found" : "No Live Session Active"}
                </h3>
                <p className="text-xs mt-2 leading-relaxed max-w-sm mx-auto" style={{ color: "#64748b" }}>
                  {classrooms.length === 0
                    ? "Create your first classroom to get started."
                    : "Start the session to broadcast live video and interact with enrolled students."}
                </p>
              </div>

              {connectionError && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-xs mx-auto"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#fca5a5",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  {connectionError}
                </div>
              )}

              {classrooms.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowCreateClassroom(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <Plus className="w-4 h-4" />
                  Create Classroom
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={isStartingSession || !isValidObjectId(selectedClassroomId)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  {isStartingSession ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4" />
                  )}
                  <span>{isStartingSession ? "Starting Session..." : "Start Live Lecture"}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Active Classroom Area ─────────────────────────────────── */
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            {/* 1. Screen Share Presentation Mode */}
            {isScreenSharing && localScreenTrack ? (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Hero Presentation Window */}
                <div
                  className="flex-1 relative rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl"
                  style={{ border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  <LiveKitTrackRenderer
                    track={localScreenTrack}
                    isLocal={true}
                    className="w-full h-full object-contain"
                  />
                  <div
                    className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Your Screen Presentation</span>
                  </div>
                </div>

                {/* Side Filmstrip of All Cameras (Teacher + Students) */}
                <div
                  className="w-full lg:w-72 flex flex-col gap-2 overflow-y-auto p-2 rounded-2xl flex-shrink-0"
                  style={{
                    background: "rgba(13,18,41,0.8)",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  {/* Teacher Camera Card */}
                  <div
                    className="relative aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500/30 flex-shrink-0"
                  >
                    {localVideoTrack && isCameraEnabled ? (
                      <LiveKitTrackRenderer
                        track={localVideoTrack}
                        isLocal={true}
                        className="w-full h-full object-cover"
                        onMetadataLoaded={handleLocalVideoMetadataLoaded}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                        <Avatar name="Instructor" size="sm" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                      You (Instructor)
                    </div>
                  </div>

                  {/* Remote Students */}
                  {participantsList.map(({ participant, videoTrack, audioTrack }) => (
                    <div
                      key={participant.identity}
                      className="relative aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500/20 flex-shrink-0"
                    >
                      {videoTrack ? (
                        <LiveKitTrackRenderer
                          track={videoTrack}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                          <Avatar name={participant.name || participant.identity} size="sm" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                        <span className="truncate">{participant.name || "Student"}</span>
                        {audioTrack ? (
                          <Mic className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* 2. Standard DYNAMIC FLEXIBLE GRID (No Screen Share) */
              /* When 1 person: 100% full stage. When 2: 50/50 split! When 3-4: 4 equal quadrants! */
              <div
                className={`flex-1 grid gap-4 w-full h-full min-h-0 ${getDynamicGridClass(
                  totalInGrid
                )}`}
              >
                {/* ── Tile 1: Instructor (You) ─────────────────────────── */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl transition-all"
                  style={{
                    background: "#000",
                    border: "1px solid rgba(99,102,241,0.25)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    minHeight: totalInGrid <= 2 ? "320px" : "180px",
                  }}
                >
                  {localVideoTrack && isCameraEnabled ? (
                    <LiveKitTrackRenderer
                      track={localVideoTrack}
                      isLocal={true}
                      className="w-full h-full object-cover"
                      onMetadataLoaded={handleLocalVideoMetadataLoaded}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                      <Avatar name="Instructor" size={totalInGrid <= 2 ? "lg" : "md"} />
                      <div>
                        <p className="text-sm font-bold text-white">Camera is turned off</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click camera icon to broadcast video</p>
                      </div>
                    </div>
                  )}

                  {/* Hidden blazeface video */}
                  {localVideoTrack && (
                    <video
                      ref={localVideoRef}
                      className="hidden"
                      autoPlay
                      playsInline
                      muted
                      onLoadedMetadata={handleLocalVideoMetadataLoaded}
                    />
                  )}

                  {/* Instructor overlay badge */}
                  <div
                    className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>You (Instructor)</span>
                  </div>

                  {/* Mic status badge */}
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md">
                    {isMicEnabled ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                </div>

                {/* ── Tiles 2+: Remote Connected Students ─────────────── */}
                {participantsList.map(({ participant, videoTrack, audioTrack }) => (
                  <div
                    key={participant.identity}
                    className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl transition-all"
                    style={{
                      background: "#000",
                      border: "1px solid rgba(99,102,241,0.2)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      minHeight: totalInGrid <= 2 ? "320px" : "180px",
                    }}
                  >
                    {videoTrack ? (
                      <LiveKitTrackRenderer
                        track={videoTrack}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2 p-4 text-center">
                        <Avatar
                          name={participant.name || participant.identity}
                          size={totalInGrid <= 2 ? "lg" : "md"}
                        />
                        <p className="text-xs font-semibold text-slate-300">
                          {participant.name || participant.identity}
                        </p>
                      </div>
                    )}

                    {/* Student Name badge */}
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="truncate max-w-[160px]">
                        {participant.name || participant.identity}
                      </span>
                    </div>

                    {/* Student Mic status */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md">
                      {audioTrack ? (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Floating Bottom Control Bar ───────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-center gap-3 px-6 py-4 z-30"
        style={{
          background: "rgba(13,18,41,0.92)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(99,102,241,0.12)",
        }}
      >
        {/* Mic */}
        <button
          onClick={toggleMicrophone}
          disabled={!isConnected}
          title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
          className="relative group w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            background: isMicEnabled ? "rgba(99,102,241,0.15)" : "rgba(239,68,68,0.85)",
            border: isMicEnabled
              ? "1px solid rgba(99,102,241,0.3)"
              : "1px solid rgba(239,68,68,0.5)",
          }}
        >
          {isMicEnabled ? (
            <Mic className="w-5 h-5 text-white" />
          ) : (
            <MicOff className="w-5 h-5 text-white" />
          )}
          <span
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#64748b" }}
          >
            {isMicEnabled ? "Mute" : "Unmute"}
          </span>
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          disabled={!isConnected}
          title={isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          className="relative group w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            background: isCameraEnabled ? "rgba(99,102,241,0.15)" : "rgba(239,68,68,0.85)",
            border: isCameraEnabled
              ? "1px solid rgba(99,102,241,0.3)"
              : "1px solid rgba(239,68,68,0.5)",
          }}
        >
          {isCameraEnabled ? (
            <Video className="w-5 h-5 text-white" />
          ) : (
            <VideoOff className="w-5 h-5 text-white" />
          )}
          <span
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#64748b" }}
          >
            {isCameraEnabled ? "Stop Video" : "Start Video"}
          </span>
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          disabled={!isConnected}
          title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          className="relative group w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
          style={{
            background: isScreenSharing ? "rgba(59,130,246,0.85)" : "rgba(99,102,241,0.15)",
            border: isScreenSharing
              ? "1px solid rgba(59,130,246,0.5)"
              : "1px solid rgba(99,102,241,0.3)",
          }}
        >
          {isScreenSharing ? (
            <ScreenShareOff className="w-5 h-5 text-white" />
          ) : (
            <ScreenShare className="w-5 h-5 text-white" />
          )}
          <span
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#64748b" }}
          >
            {isScreenSharing ? "Stop Share" : "Share Screen"}
          </span>
        </button>

        {/* In-Call Chat Toggle Button */}
        <button
          onClick={() => setShowChat((prev) => !prev)}
          title={showChat ? "Close In-Call Chat" : "Open In-Call Chat"}
          className="relative group w-12 h-12 rounded-full flex items-center justify-center transition-all"
          style={{
            background: showChat ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(99,102,241,0.15)",
            border: showChat
              ? "1px solid rgba(139,92,246,0.5)"
              : "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "#64748b" }}
          >
            {showChat ? "Close Chat" : "Live Chat"}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 mx-1" style={{ background: "rgba(99,102,241,0.15)" }} />

        {/* End Lecture Button */}
        <button
          onClick={handleEndLecture}
          title="End Live Session"
          className="relative group flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
          }}
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Lecture</span>
        </button>
      </div>

      {/* ── Create Classroom Modal Dialog ─────────────────────────────── */}
      {showCreateClassroom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl"
            style={{
              background: "#0d1229",
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  <BookOpen className="w-4.5 h-4.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Create New Classroom</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateClassroom(false);
                  setCreateClassError("");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {createClassError && (
              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                {createClassError}
              </div>
            )}

            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">
                  Classroom Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={newClassTitle}
                  onChange={(e) => setNewClassTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">
                  Course Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-301"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-400">Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. CSE"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                    style={{
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-400">Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                    style={{
                      background: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Description</label>
                <textarea
                  placeholder="Optional classroom description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all resize-none"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateClassroom(false);
                    setCreateClassError("");
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-80"
                  style={{
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClassroom}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  {isCreatingClassroom && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {isCreatingClassroom ? "Creating..." : "Create Classroom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Classroom Roster Modal ─────────────────────────────────────── */}
      {showRoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
            style={{
              background: "#0d1229",
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              maxHeight: "88vh",
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(99,102,241,0.12)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <Users className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Roster & Enrollment</h3>
                  <p className="text-[11px] text-slate-400">{selectedClassroom?.title || "Classroom"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRoster(false);
                  setRosterError("");
                  setRosterSuccess("");
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {rosterError && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-xs text-red-300"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  {rosterError}
                </div>
              )}
              {rosterSuccess && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-xs text-emerald-300"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  {rosterSuccess}
                </div>
              )}

              <form
                onSubmit={handleEnrollStudent}
                className="p-4 rounded-2xl space-y-3"
                style={{
                  background: "rgba(99,102,241,0.05)",
                  border: "1px solid rgba(99,102,241,0.12)",
                }}
              >
                <label className="block text-xs font-bold text-slate-400">
                  Enroll Student by Email or Roll Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter student email or roll number"
                    value={enrollInput}
                    onChange={(e) => setEnrollInput(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isEnrolling || !enrollInput.trim()}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    {isEnrolling ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5" />
                    )}
                    Enroll
                  </button>
                </div>
              </form>

              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(99,102,241,0.12)" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    borderBottom: "1px solid rgba(99,102,241,0.1)",
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    Enrolled Students ({roster.filter((r) => r.status === "enrolled").length})
                  </span>
                  <button
                    type="button"
                    onClick={fetchRoster}
                    disabled={isLoadingRoster}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-400"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingRoster ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {roster.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs font-medium text-slate-400">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-indigo-900/20">
                    {roster.map((item) => {
                      const student = item.studentId || {};
                      const isEnrolled = item.status === "enrolled";
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-indigo-950/20 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={student.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {student.name || "Student"}
                              </p>
                              <p className="text-[11px] truncate text-slate-400">
                                {student.email}
                                {student.rollNo ? ` · Roll: ${student.rollNo}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{
                                background: isEnrolled
                                  ? "rgba(16,185,129,0.1)"
                                  : "rgba(239,68,68,0.1)",
                                border: isEnrolled
                                  ? "1px solid rgba(16,185,129,0.2)"
                                  : "1px solid rgba(239,68,68,0.2)",
                                color: isEnrolled ? "#34d399" : "#f87171",
                              }}
                            >
                              {item.status}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleEnrollmentStatus(student._id, item.status)
                              }
                              className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all"
                              style={{
                                background: isEnrolled
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(16,185,129,0.1)",
                                border: isEnrolled
                                  ? "1px solid rgba(239,68,68,0.2)"
                                  : "1px solid rgba(16,185,129,0.2)",
                                color: isEnrolled ? "#f87171" : "#34d399",
                              }}
                            >
                              {isEnrolled ? "Drop" : "Re-enroll"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex-shrink-0 flex justify-end px-6 py-4"
              style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
            >
              <button
                type="button"
                onClick={() => setShowRoster(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-Call Live Chat Drawer (Docked to Right Side) ─────────────── */}
      <Message
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        isDocked={true}
        title="In-Call Live Chat"
        room={room}
        classroomId={selectedClassroomId}
      />
    </div>
  );
};

export default AdminLive;
