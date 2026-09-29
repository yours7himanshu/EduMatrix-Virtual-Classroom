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
} from "livekit-client";

// Icons
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  Radio,
  PhoneOff,
  RefreshCw,
  GraduationCap,
  Wifi,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import StudentChat from "./StudentChat";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ─── Track Renderer ─────────────────────────────────────────────────── */
const LiveKitTrackRenderer = ({
  track,
  isLocal = false,
  className = "w-full h-full object-cover",
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
const StudentLive = () => {
  const { classroomId: paramClassroomId } = useParams();
  const navigate = useNavigate();

  const isValidObjectId = (id) =>
    typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  // Classroom & Session
  const [enrolledClassrooms, setEnrolledClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState(
    isValidObjectId(paramClassroomId) ? paramClassroomId : ""
  );
  const [activeSession, setActiveSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionEndedMessage, setSessionEndedMessage] = useState("");

  // LiveKit
  const [room, setRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // Media
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  // Remote streams
  const [teacherStream, setTeacherStream] = useState(null);
  const [classmates, setClassmates] = useState(new Map());

  // In-Call Chat Drawer State
  const [showChat, setShowChat] = useState(false);

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

  // 1. Fetch enrolled classrooms
  useEffect(() => {
    const fetchEnrolledClassrooms = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/classrooms/my/enrolled`,
          getAuthHeaders()
        );
        if (res.data?.success && Array.isArray(res.data.classrooms)) {
          setEnrolledClassrooms(res.data.classrooms);
          if (res.data.classrooms.length > 0 && !selectedClassroomId) {
            setSelectedClassroomId(res.data.classrooms[0]._id);
          }
        }
      } catch (err) {
        console.warn("Could not fetch enrolled classrooms:", err.message);
      }
    };
    fetchEnrolledClassrooms();
  }, []);

  // 2. Poll active session
  const checkActiveSession = useCallback(async () => {
    if (!isValidObjectId(selectedClassroomId)) {
      setIsLoadingSession(false);
      return;
    }
    try {
      const res = await axios.get(
        `${backendUrl}/api/classrooms/${selectedClassroomId}/sessions/active`,
        getAuthHeaders()
      );
      if (res.data?.success) {
        setActiveSession(res.data.session || null);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setConnectionError("You are not actively enrolled in this classroom.");
      }
      setActiveSession(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    checkActiveSession();
    const interval = setInterval(() => {
      if (!isConnected) {
        checkActiveSession();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [checkActiveSession, isConnected]);

  // 3. Connect to LiveKit
  const connectToLiveKit = useCallback(async () => {
    if (!isValidObjectId(selectedClassroomId)) return;
    setIsConnecting(true);
    setConnectionError("");
    setSessionEndedMessage("");

    try {
      const tokenRes = await axios.post(
        `${backendUrl}/api/live/token`,
        { classroomId: selectedClassroomId },
        getAuthHeaders()
      );
      if (!tokenRes.data?.success || !tokenRes.data.token) {
        throw new Error(tokenRes.data?.message || "Failed to obtain live token");
      }
      const { token, livekitUrl } = tokenRes.data;

      const newRoom = new Room({ adaptiveStream: true, dynacast: true });

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        const isTeacher =
          participant.identity.startsWith("teacher_") ||
          participant.identity.startsWith("director_");

        if (track.kind === Track.Kind.Audio) {
          track.attach();
        }

        if (isTeacher) {
          setTeacherStream((prev) => {
            const current = prev || { participant };
            if (publication.source === Track.Source.ScreenShare) {
              current.screenTrack = track;
            } else if (track.kind === Track.Kind.Video) {
              current.videoTrack = track;
            } else if (track.kind === Track.Kind.Audio) {
              current.audioTrack = track;
            }
            return { ...current };
          });
        } else {
          setClassmates((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(participant.identity) || { participant };
            if (track.kind === Track.Kind.Video) existing.videoTrack = track;
            if (track.kind === Track.Kind.Audio) existing.audioTrack = track;
            updated.set(participant.identity, existing);
            return updated;
          });
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        const isTeacher =
          participant.identity.startsWith("teacher_") ||
          participant.identity.startsWith("director_");

        if (track.kind === Track.Kind.Audio) {
          track.detach();
        }

        if (isTeacher) {
          setTeacherStream((prev) => {
            if (!prev) return null;
            if (publication.source === Track.Source.ScreenShare) prev.screenTrack = null;
            if (track.kind === Track.Kind.Video) prev.videoTrack = null;
            if (track.kind === Track.Kind.Audio) prev.audioTrack = null;
            return { ...prev };
          });
        } else {
          setClassmates((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(participant.identity);
            if (existing) {
              if (track.kind === Track.Kind.Video) existing.videoTrack = null;
              if (track.kind === Track.Kind.Audio) existing.audioTrack = null;
              if (!existing.videoTrack && !existing.audioTrack) {
                updated.delete(participant.identity);
              } else {
                updated.set(participant.identity, existing);
              }
            }
            return updated;
          });
        }
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        const isTeacher =
          participant.identity.startsWith("teacher_") ||
          participant.identity.startsWith("director_");
        if (isTeacher) {
          setTeacherStream(null);
        } else {
          setClassmates((prev) => {
            const updated = new Map(prev);
            updated.delete(participant.identity);
            return updated;
          });
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setRoom(null);
        setTeacherStream(null);
        setClassmates(new Map());
        setSessionEndedMessage("The live lecture has ended. Thank you for attending!");
      });

      await newRoom.connect(livekitUrl, token);

      try {
        await newRoom.localParticipant.enableCameraAndMicrophone();
        const videoPub = Array.from(newRoom.localParticipant.videoTrackPublications.values())[0];
        const audioPub = Array.from(newRoom.localParticipant.audioTrackPublications.values())[0];
        if (videoPub?.track) setLocalVideoTrack(videoPub.track);
        if (audioPub?.track) setLocalAudioTrack(audioPub.track);
      } catch (mediaErr) {
        console.warn("Student media access denied or not found:", mediaErr);
      }

      setRoom(newRoom);
      setIsConnected(true);
    } catch (err) {
      console.error("Student LiveKit connection error:", err);
      setConnectionError(
        err.response?.data?.message || err.message || "Failed to join live class"
      );
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [selectedClassroomId]);

  useEffect(() => {
    if (activeSession && !isConnected && !isConnecting && !room && !sessionEndedMessage) {
      connectToLiveKit();
    }
  }, [activeSession, isConnected, isConnecting, room, sessionEndedMessage, connectToLiveKit]);

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

  const handleLeaveClass = () => {
    if (room) {
      room.disconnect();
    }
    navigate("/StudentDashboard/dashboard");
  };

  const classmateList = Array.from(classmates.values());

  // ── Dynamic Grid Calculation ───────────────────────────────────────
  // Total participants in grid = (1 if teacherStream else 0) + 1 (You) + classmateList.length
  const totalInGrid = (teacherStream ? 1 : 0) + 1 + classmateList.length;

  const getDynamicGridClass = (count) => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 grid-rows-1";
    if (count === 3) return "grid-cols-1 md:grid-cols-3 grid-rows-1";
    if (count === 4) return "grid-cols-1 min-[480px]:grid-cols-2 min-[480px]:grid-rows-2";
    if (count <= 6) return "grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3";
    return "grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  };

  /* ─── JSX ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex min-h-screen w-full flex-col text-white antialiased overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1229 50%, #0a0f1e 100%)" }}
    >
      {/* ── Top Header Bar ───────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 w-full px-3 sm:px-5 py-2.5 sm:py-3 flex flex-col gap-2.5 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between min-[560px]:gap-3 z-20 border-b"
        style={{
          background: "rgba(13,18,41,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(99,102,241,0.18)",
          boxShadow: "0 1px 0 rgba(99,102,241,0.08)",
          paddingTop: "calc(0.625rem + env(safe-area-inset-top, 0px))",
        }}
      >
        {/* Left: Brand + Classroom selector */}
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
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
            LIVE CLASS
          </div>

          {enrolledClassrooms.length > 0 ? (
            <select
              value={selectedClassroomId}
              onChange={(e) => {
                if (room) room.disconnect();
                setSelectedClassroomId(e.target.value);
              }}
              disabled={isConnected}
              aria-label="Select classroom"
              className="min-h-[44px] w-full min-w-0 max-w-full appearance-none rounded-lg py-2.5 pl-3 pr-8 text-base font-semibold text-white focus:outline-none min-[560px]:w-auto min-[560px]:max-w-[220px] min-[560px]:py-1.5 min-[560px]:pr-7 min-[560px]:text-xs cursor-pointer"
              style={{
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              {enrolledClassrooms.map((c) => (
                <option key={c._id} value={c._id} style={{ background: "#0d1229" }}>
                  {c.courseCode ? `${c.courseCode} — ` : ""}
                  {c.title}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-medium" style={{ color: "#64748b" }}>
              {selectedClassroomId || "No classrooms"}
            </span>
          )}

          {activeSession && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#34d399",
              }}
            >
              <Wifi className="w-3 h-3" />
              {activeSession.title || "Live in session"}
            </span>
          )}
        </div>

        {/* Right: Classmates count + In-Call Chat Toggle + Leave */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
          {isConnected && classmateList.length > 0 && (
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{classmateList.length} classmates</span>
            </div>
          )}

          {/* In-Call Chat Button */}
          {isConnected && (
            <button
              type="button"
              onClick={() => setShowChat((prev) => !prev)}
              aria-expanded={showChat}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all min-[560px]:min-h-0 min-[560px]:px-3 min-[560px]:py-1.5"
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
          )}

          <button
            onClick={handleLeaveClass}
            className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white transition-all hover:opacity-80 min-[560px]:min-h-0 min-[560px]:px-3.5 min-[560px]:py-1.5"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-3 sm:p-4 gap-3 sm:gap-4 overflow-y-auto overscroll-contain min-h-0 relative">
        {/* Session Ended Banner */}
        {sessionEndedMessage ? (
          <div className="my-auto flex items-center justify-center px-1 py-6">
            <div
              className="w-full max-w-md rounded-2xl p-5 sm:p-8 text-center space-y-5 shadow-2xl"
              style={{
                background: "rgba(13,18,41,0.95)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <PhoneOff className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Lecture Concluded</h2>
                <p className="text-xs mt-2 text-slate-400">{sessionEndedMessage}</p>
              </div>
              <button
                onClick={handleLeaveClass}
                className="w-full py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Return to Student Dashboard
              </button>
            </div>
          </div>
        ) : !activeSession && !isLoadingSession ? (
          /* Waiting Screen */
          <div className="my-auto flex items-center justify-center px-1 py-6">
            <div
              className="w-full max-w-lg rounded-2xl p-5 sm:p-10 text-center space-y-5 shadow-2xl"
              style={{
                background: "rgba(13,18,41,0.95)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <Radio
                  className="w-10 h-10 text-indigo-400"
                  style={{ animation: enrolledClassrooms.length > 0 ? "pulse 2s infinite" : "none" }}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {enrolledClassrooms.length === 0
                    ? "No Enrolled Classrooms"
                    : "Waiting for Instructor"}
                </h2>
                <p className="text-xs mt-2 leading-relaxed max-w-sm mx-auto text-slate-400">
                  {enrolledClassrooms.length === 0
                    ? "You are not currently enrolled in any classrooms. Contact your teacher or registrar to be enrolled."
                    : "No live lecture is currently active. The stream will automatically connect as soon as the instructor starts broadcasting."}
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

              {enrolledClassrooms.length > 0 && (
                <button
                  onClick={checkActiveSession}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.2)",
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Check Again
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ── Active Classroom Area ─────────────────────────────────── */
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            {/* 1. Teacher Screen Share Presentation Mode */}
            {teacherStream?.screenTrack ? (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                {/* Hero Presentation Window */}
                <div
                  className="flex-1 relative rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl"
                  style={{ border: "1px solid rgba(99,102,241,0.3)" }}
                >
                  <LiveKitTrackRenderer
                    track={teacherStream.screenTrack}
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
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {teacherStream?.participant?.name || "Instructor"} · Screen Presentation
                    </span>
                  </div>
                </div>

                {/* Side Strip of Cameras (Teacher + You + Classmates) */}
                <div
                  className="w-full lg:w-72 flex flex-col gap-2 overflow-y-auto overscroll-contain p-2 rounded-2xl flex-shrink-0 max-h-[38dvh] lg:max-h-none"
                  style={{
                    background: "rgba(13,18,41,0.8)",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  {/* Instructor Camera */}
                  {teacherStream?.videoTrack && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500/30 flex-shrink-0">
                      <LiveKitTrackRenderer
                        track={teacherStream.videoTrack}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                        {teacherStream?.participant?.name || "Instructor"}
                      </div>
                    </div>
                  )}

                  {/* Student Local Camera (You) */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-indigo-500/30 flex-shrink-0">
                    {localVideoTrack && isCameraEnabled ? (
                      <LiveKitTrackRenderer
                        track={localVideoTrack}
                        isLocal={true}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                        <Avatar name="You" size="sm" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
                      You
                    </div>
                  </div>

                  {/* Other Classmates */}
                  {classmateList.map(({ participant, videoTrack, audioTrack }) => (
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
                        <span className="truncate">{participant.name || "Classmate"}</span>
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
                className={`flex-1 grid gap-3 sm:gap-4 w-full h-full min-h-0 auto-rows-[minmax(220px,auto)] sm:auto-rows-auto ${getDynamicGridClass(
                  totalInGrid
                )}`}
              >
                {/* ── Tile 1: Instructor ───────────────────────────────── */}
                {teacherStream && (
                  <div
                    className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl transition-all"
                    style={{
                      background: "#000",
                      border: "1px solid rgba(99,102,241,0.3)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      minHeight: "220px",
                    }}
                  >
                    {teacherStream?.videoTrack ? (
                      <LiveKitTrackRenderer
                        track={teacherStream.videoTrack}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                        <Avatar
                          name={teacherStream?.participant?.name || "Instructor"}
                          size={totalInGrid <= 2 ? "lg" : "md"}
                        />
                        <div>
                          <p className="text-sm font-bold text-white">
                            {teacherStream?.audioTrack ? "Instructor (Audio Only)" : "Instructor"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {teacherStream?.audioTrack
                              ? "Audio broadcast is active"
                              : "Instructor camera is off"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Teacher overlay badge */}
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{teacherStream?.participant?.name || "Instructor"}</span>
                    </div>

                    {/* Teacher Mic status */}
                    <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md">
                      {teacherStream?.audioTrack ? (
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <MicOff className="w-3.5 h-3.5 text-red-400" />
                      )}
                    </div>
                  </div>
                )}

                {/* ── Tile 2: Student Local Video (You) ────────────────── */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl transition-all"
                  style={{
                    background: "#000",
                    border: "1px solid rgba(99,102,241,0.25)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    minHeight: "220px",
                  }}
                >
                  {localVideoTrack && isCameraEnabled ? (
                    <LiveKitTrackRenderer
                      track={localVideoTrack}
                      isLocal={true}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                      <Avatar name="You" size={totalInGrid <= 2 ? "lg" : "md"} />
                      <div>
                        <p className="text-sm font-bold text-white">Your camera is off</p>
                        <p className="text-xs text-slate-400 mt-0.5">Click camera icon to enable</p>
                      </div>
                    </div>
                  )}

                  {/* Student badge */}
                  <div
                    className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                    style={{
                      background: "rgba(0,0,0,0.75)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>You</span>
                  </div>

                  {/* Student Mic status */}
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 backdrop-blur-md">
                    {isMicEnabled ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                </div>

                {/* ── Tiles 3+: Remote Classmates ──────────────────────── */}
                {classmateList.map(({ participant, videoTrack, audioTrack }) => (
                  <div
                    key={participant.identity}
                    className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl transition-all"
                    style={{
                      background: "#000",
                      border: "1px solid rgba(99,102,241,0.2)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      minHeight: "220px",
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

                    {/* Classmate Name badge */}
                    <div
                      className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="truncate max-w-[160px]">
                        {participant.name || participant.identity}
                      </span>
                    </div>

                    {/* Classmate Mic status */}
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
      {isConnected && (
        <div
          className="flex-shrink-0 z-30 border-t"
          style={{
            background: "rgba(13,18,41,0.92)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(99,102,241,0.12)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
        <div className="no-scrollbar mx-auto flex w-full max-w-3xl items-center justify-center gap-2 overflow-x-auto px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
          {/* Mic */}
          <button
            onClick={toggleMicrophone}
            title={isMicEnabled ? "Mute Microphone" : "Unmute Microphone"}
            aria-label={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
            aria-pressed={isMicEnabled}
            className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95"
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
            title={isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
            aria-label={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
            aria-pressed={isCameraEnabled}
            className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95"
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

          {/* In-Call Chat Button */}
          <button
            onClick={() => setShowChat((prev) => !prev)}
            title={showChat ? "Close Chat" : "Live Chat"}
            aria-label={showChat ? "Close live chat" : "Open live chat"}
            aria-expanded={showChat}
            className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: showChat
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "rgba(99,102,241,0.15)",
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

          {/* Leave Session */}
          <button
            onClick={handleLeaveClass}
            title="Leave Session"
            aria-label="Leave session"
            className="relative group flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 sm:gap-2.5 sm:px-6 sm:py-3"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
            }}
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
        </div>
      )}

      {/* ── In-Call Live Chat Drawer (Docked to Right Side) ─────────────── */}
      <StudentChat
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        title="Classroom Chat"
        room={room}
        classroomId={selectedClassroomId}
      />
    </div>
  );
};

export default StudentLive;