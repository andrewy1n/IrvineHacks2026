import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNebulaStore } from "@/store/nebulaStore";
import type { SolvedProblem } from "@/lib/types";
import { apiFetch } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle, ExternalLink, ShieldCheck, Loader2, FileText, ChevronDown, ChevronUp, Mic, Square, CheckCircle, Brain, BookOpen } from "lucide-react";
import Spline from "@splinetool/react-spline";

function SolvedQuestionCard({ sp }: { sp: SolvedProblem }) {
  const [expanded, setExpanded] = useState(false);
  const options = Array.isArray(sp.options) ? sp.options : [];
  return (
      <div className="rounded-lg bg-white/[0.02] border border-white/10 overflow-hidden backdrop-blur-md">
          <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-white/[0.05] transition-colors"
          >
              <p className="text-xs text-white/90 leading-snug line-clamp-2 flex-1 min-w-0">
                  {sp.question}
              </p>
              <span
                  className={`text-[9px] font-semibold uppercase shrink-0 ${
                      sp.eval_result === "correct"
                          ? "text-emerald-400"
                          : sp.eval_result === "partial"
                            ? "text-yellow-400"
                            : "text-red-400"
                  }`}
              >
                  {sp.eval_result}
              </span>
              {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
              ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
              )}
          </button>
          {expanded && (
              <div className="px-3 pb-3 pt-0 border-t border-white/10 space-y-2 bg-black/20">
                  <p className="text-xs text-white/90 leading-relaxed pt-2">
                      {sp.question}
                  </p>
                  {options.length > 0 && (
                      <div className="space-y-1">
                          <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">Options</span>
                          <ul className="text-xs text-white/80 space-y-0.5">
                              {options.map((opt, i) => (
                                  <li key={i}>{opt}</li>
                              ))}
                          </ul>
                      </div>
                  )}
                  <div className="text-[10px] space-y-1 mt-2 p-2 bg-white/5 rounded">
                      <p><span className="text-white/50">Your answer:</span> <span className="text-white/90">{sp.user_answer || "—"}</span></p>
                      <p><span className="text-white/50">Correct answer:</span> <span className="text-emerald-400">{sp.correct_answer || "—"}</span></p>
                  </div>
                  {sp.created_at && (
                      <p className="text-[10px] text-white/40 pt-1">{new Date(sp.created_at).toLocaleDateString()}</p>
                  )}
              </div>
          )}
      </div>
  );
}

export default function NodeDrawer() {
  const selectedNode = useNebulaStore((s) => s.selectedNode);
  const selectNode = useNebulaStore((s) => s.selectNode);
  const resources = useNebulaStore((s) => s.resources);
  const resourcesLoading = useNebulaStore((s) => s.resourcesLoading);
  const pollLoading = useNebulaStore((s) => s.pollLoading);
  const pollModalOpen = useNebulaStore((s) => s.pollModalOpen);
  const generatePoll = useNebulaStore((s) => s.generatePoll);
  const submitWritten = useNebulaStore((s) => s.submitWritten);
  const submitFeynman = useNebulaStore((s) => s.submitFeynman);
  const solvedProblems = useNebulaStore((s) => s.solvedProblems);
  const solvedProblemsLoading = useNebulaStore((s) => s.solvedProblemsLoading);

  const [writtenQuestion, setWrittenQuestion] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [fetchingWritten, setFetchingWritten] = useState(false);
  const [submittingWritten, setSubmittingWritten] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef("");
  const [submittingFeynman, setSubmittingFeynman] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
      setWrittenQuestion("");
      setWrittenAnswer("");
      setTranscript("");
      transcriptRef.current = "";
      setIsRecording(false);
      if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
      }
  }, [selectedNode?.id]);

  const handleFetchWritten = async () => {
      if (!selectedNode) return;
      setFetchingWritten(true);
      try {
          const res = await apiFetch(`/api/concepts/${selectedNode.id}/written-question`, { method: "POST" });
          if (res.ok) {
              const data = await res.json();
              setWrittenQuestion(data.question);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setFetchingWritten(false);
      }
  };

  const handleSubmitWritten = async () => {
      if (!selectedNode || !writtenAnswer.trim()) return;
      setSubmittingWritten(true);
      await submitWritten(selectedNode.id, writtenAnswer, writtenQuestion);
      setSubmittingWritten(false);
      setWrittenAnswer("");
      setWrittenQuestion("");
  };

  const toggleRecording = () => {
      if (isRecording) {
          if (recognitionRef.current) recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          setTranscript("");
          transcriptRef.current = "";
          // @ts-ignore
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.onresult = (event: any) => {
                  let currentTranscript = '';
                  for (let i = 0; i < event.results.length; i++) {
                      currentTranscript += event.results[i][0].transcript;
                  }
                  setTranscript(currentTranscript);
                  transcriptRef.current = currentTranscript;
              };
              recognition.onend = () => {
                  setIsRecording(false);
              };
              recognition.start();
              recognitionRef.current = recognition;
              setIsRecording(true);
          } else {
              alert("Speech recognition not supported in this browser.");
          }
      }
  };

  const handleSubmitFeynman = async () => {
      const finalTranscript = transcriptRef.current;
      if (!selectedNode || !finalTranscript.trim()) return;
      if (isRecording && recognitionRef.current) {
          recognitionRef.current.stop();
      }
      setSubmittingFeynman(true);
      await submitFeynman(selectedNode.id, finalTranscript);
      
      // Check if it reached 1.0 after submission
      const updatedNode = useNebulaStore.getState().selectedNode;
      if (updatedNode && updatedNode.confidence === 1.0) {
          confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#34d399', '#059669', '#ffffff']
          });
      }
      
      setSubmittingFeynman(false);
      setIsRecording(false);
      setTranscript("");
      transcriptRef.current = "";
  };

  const node = selectedNode;

  if (!node) return null;

  const conf = node.confidence ?? 0;
  let badgeText = "⚪ Not Started";
  let badgeClass = "bg-white/10 text-white border-white/20";
  if (conf > 0 && conf < 0.4) {
    badgeText = "🔴 Struggling";
    badgeClass = "bg-red-500/20 text-red-100 border-red-500/40";
  } else if (conf >= 0.4 && conf < 0.6) {
    badgeText = "🟡 Exposure";
    badgeClass = "bg-yellow-500/20 text-yellow-100 border-yellow-500/40";
  } else if (conf >= 0.6 && conf < 0.8) {
    badgeText = "🟢 Recall";
    badgeClass = "bg-emerald-500/20 text-emerald-100 border-emerald-500/40";
  } else if (conf >= 0.8 && conf < 1.0) {
    badgeText = "🟢 Synthesis";
    badgeClass = "bg-green-500/30 text-green-100 border-green-500/50";
  } else if (conf === 1.0) {
    badgeText = "🌟 Feynman";
    badgeClass = "bg-emerald-600/40 text-emerald-50 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  }

  return (
    <Sheet open={!!selectedNode} modal={!pollModalOpen} onOpenChange={(open) => { if (!open && !pollModalOpen) selectNode(null); }}>
      <SheetContent
        onInteractOutside={(e) => { if (pollModalOpen || isRecording) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (pollModalOpen || isRecording) e.preventDefault(); }}
        className="flex flex-col border-white/20 bg-black/40 p-0 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-3xl sm:max-w-md"
      >
        <div className="flex-1 overflow-y-auto p-8">
          <SheetHeader className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide shadow-inner ${badgeClass}`}
              >
                {badgeText}
              </div>
              <span className="text-sm font-medium text-white/70 tracking-wide">
                {Math.round((node.confidence ?? 0) * 100)}% Mastered
              </span>
            </div>
            <SheetTitle className="text-3xl font-medium tracking-wide uppercase text-white">
              {node.label}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-10">
            <div className="space-y-3">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/60">
                Concept Definition
              </h4>
              <p className="leading-relaxed text-white/90 text-sm tracking-wide">{node.description}</p>
            </div>

            {(resources.length > 0 || resourcesLoading) && (
              <div className="space-y-4">
                <h4 className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
                  Targeted Resources
                </h4>
                {resourcesLoading ? (
                  <div className="flex items-center gap-3 text-sm text-white/70 tracking-wide uppercase">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading resources...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resources.map((r, i) => (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex cursor-pointer items-center rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/30 hover:bg-white/[0.08] shadow-inner backdrop-blur-md"
                        onClick={() => {
                          if (conf < 0.4 && node.id) {
                            // Automatically bump confidence to 0.4 (Exposure -> Building/Recall tier)
                            // when user starts reading the material.
                            useNebulaStore.getState().updateMasteryDelta(node.id, 0.4);
                          }
                        }}
                      >
                        {r.type === "video" ? (
                          <PlayCircle className="mr-3 h-6 w-6 shrink-0 text-white group-hover:scale-110 transition-transform" />
                        ) : (
                          <FileText className="mr-3 h-6 w-6 shrink-0 text-white group-hover:scale-110 transition-transform" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-white/90 transition-colors group-hover:text-white tracking-wide">
                            {r.title}
                          </p>
                          <p className="text-xs text-white/50 uppercase tracking-widest mt-0.5">{r.type}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-white/30 group-hover:text-white/70 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="mb-4 text-sm font-medium uppercase tracking-widest text-white/60">
                Questions you've solved
              </h4>
              {solvedProblemsLoading ? (
                <div className="flex items-center gap-3 text-sm text-white/70 tracking-wide uppercase">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : solvedProblems.length === 0 ? (
                <p className="text-sm text-white/40">
                  No questions yet. Generate a question to test your knowledge!
                </p>
              ) : (
                <div className="space-y-3">
                  {solvedProblems.map((sp) => (
                    <SolvedQuestionCard key={sp.id} sp={sp} />
                  ))}
                </div>
              )}
            </div>

            <div className="h-24" />
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          {conf < 0.4 && (
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <BookOpen className="w-6 h-6 text-white/50 mx-auto mb-2" />
              <p className="text-sm text-white/80">Read your notes or canvas resources to unlock practice.</p>
            </div>
          )}

          {conf >= 0.4 && conf < 0.6 && (
            <Button
              className="mb-4 h-12 w-full font-medium tracking-widest uppercase text-white shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/50 backdrop-blur-md"
              onClick={() => generatePoll(node.id)}
              disabled={pollLoading}
            >
              {pollLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-5 w-5" />
              )}
              Generate Question
            </Button>
          )}

          {conf >= 0.6 && conf < 0.8 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/80 flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                Synthesis Challenge
              </h4>
              {!writtenQuestion ? (
                <Button
                  className="w-full h-10 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  onClick={handleFetchWritten}
                  disabled={fetchingWritten}
                >
                  {fetchingWritten ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                  Get Synthesis Prompt
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/90 bg-white/5 p-3 rounded-lg border border-white/10">{writtenQuestion}</p>
                  <Textarea 
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    placeholder="Write your explanation here..."
                    className="bg-black/20 border-white/20 text-white min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="text-xs text-white/50 hover:text-white"
                      onClick={() => {
                        setWrittenQuestion("");
                        setWrittenAnswer("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-10 bg-emerald-600/50 hover:bg-emerald-500/60 text-white"
                      onClick={handleSubmitWritten}
                      disabled={submittingWritten || !writtenAnswer.trim()}
                    >
                      {submittingWritten ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Submit Answer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {conf >= 0.8 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-widest text-white/80 flex items-center gap-2">
                <Mic className="w-4 h-4 text-emerald-400" />
                Feynman Voice Challenge
              </h4>
              
              {/* Optional Success state instead of inputs */}
              {conf === 1.0 && !isRecording && !transcript && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-emerald-100 font-medium tracking-wide">Elite Mastery Achieved</p>
                      <p className="text-xs text-emerald-300/70 mt-1">You have successfully explained this concept.</p>
                      <Button 
                          variant="ghost" 
                          className="mt-3 text-xs text-white/50 hover:text-white"
                          onClick={() => {
                              // Reset to allow re-trying
                              setTranscript("");
                          }}
                      >
                          Try again
                      </Button>
                  </div>
              )}

              {/* Show recording UI if not mastered, OR if user wants to try again (indicated by interaction) */}
              {(conf < 1.0 || isRecording || transcript) && (
                  <>
                      {isRecording && typeof window !== "undefined" && createPortal(
                        <div 
                          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center backdrop-blur-md"
                        >
                          <div 
                            className="absolute inset-0 cursor-pointer" 
                            onClick={() => {
                              if (recognitionRef.current) {
                                try { recognitionRef.current.stop(); } catch (err) {}
                              }
                              setIsRecording(false);
                              setTranscript("");
                              transcriptRef.current = "";
                            }}
                          />
                          <div className="w-full h-[70vh] max-w-5xl relative pointer-events-none z-10">
                            <div className="absolute top-8 left-8 pointer-events-auto">
                              <Button 
                                variant="ghost" 
                                className="text-white/50 hover:text-white border border-white/10 hover:bg-white/10 bg-black/40 rounded-full px-6 text-sm"
                                onClick={() => {
                                  if (recognitionRef.current) {
                                    try { recognitionRef.current.stop(); } catch (err) {}
                                  }
                                  setIsRecording(false);
                                  setTranscript("");
                                  transcriptRef.current = "";
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                            <div className="w-full h-full pointer-events-auto">
                            <Spline 
                              scene="/assets/rememberall_robot.spline" 
                              className="w-full h-full" 
                              onLoad={(spline) => {
                                // Simulate a click to trigger the "look at cursor" interaction
                                setTimeout(() => {
                                  if (spline && spline._canvas) {
                                    const rect = spline._canvas.getBoundingClientRect();
                                    const x = rect.left + rect.width / 2;
                                    const y = rect.top + rect.height / 2;
                                    
                                    const mousedown = new MouseEvent('mousedown', {
                                      view: window,
                                      bubbles: true,
                                      cancelable: true,
                                      clientX: x,
                                      clientY: y
                                    });
                                    spline._canvas.dispatchEvent(mousedown);

                                    const mouseup = new MouseEvent('mouseup', {
                                      view: window,
                                      bubbles: true,
                                      cancelable: true,
                                      clientX: x,
                                      clientY: y
                                    });
                                    spline._canvas.dispatchEvent(mouseup);

                                    const click = new MouseEvent('click', {
                                      view: window,
                                      bubbles: true,
                                      cancelable: true,
                                      clientX: x,
                                      clientY: y
                                    });
                                    spline._canvas.dispatchEvent(click);
                                    
                                    // Also try calling emitEvent directly if the spline app supports it
                                    try {
                                        // @ts-ignore
                                        if (spline.emitEvent) spline.emitEvent('mouseDown');
                                    } catch (e) {}
                                  }
                                }, 500);
                              }}
                            />
                            </div>
                            {submittingFeynman ? (
                              <div className="absolute top-8 right-8 flex items-center gap-2 bg-yellow-500/20 text-yellow-200 px-4 py-2 rounded-full border border-yellow-500/30 text-sm pointer-events-auto">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Processing
                              </div>
                            ) : (
                              <div className="absolute top-8 right-8 flex items-center gap-2 bg-red-500/20 text-red-200 px-4 py-2 rounded-full border border-red-500/30 text-sm animate-pulse pointer-events-auto">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                Recording
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full max-w-2xl px-6 pointer-events-auto z-20">
                            <div className="bg-black/60 border border-white/20 rounded-xl p-6 w-full min-h-[100px] max-h-[200px] overflow-y-auto text-center text-lg text-white/90 backdrop-blur-xl shadow-2xl">
                              {transcript || <span className="text-white/40 italic">Listening to your explanation...</span>}
                            </div>
                            <Button
                              size="lg"
                              className={`h-16 rounded-full text-white border px-8 text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] ${
                                submittingFeynman 
                                  ? 'bg-red-900/50 border-red-900/50 cursor-not-allowed opacity-80' 
                                  : 'bg-red-500/50 hover:bg-red-500/60 border-red-500/50 animate-pulse'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (submittingFeynman) return;
                                if (transcriptRef.current.trim()) {
                                  handleSubmitFeynman();
                                } else {
                                  toggleRecording();
                                }
                              }}
                              disabled={submittingFeynman}
                            >
                              {submittingFeynman ? (
                                <>
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                  Processing Answer...
                                </>
                              ) : (
                                <>
                                  <Square className="w-6 h-6 fill-current" />
                                  Stop Recording
                                </>
                              )}
                            </Button>
                          </div>
                        </div>,
                        document.body
                      )}

                      {!isRecording && (
                        <>
                          <div className="bg-black/20 border border-white/10 rounded-lg p-3 min-h-[60px] max-h-[120px] overflow-y-auto text-sm text-white/80 mb-4">
                            {transcript || <span className="text-white/30 italic">Start speaking to explain this concept...</span>}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 h-10 bg-white/10 hover:bg-white/20 text-white border border-white/20"
                              onClick={toggleRecording}
                            >
                              <Mic className="w-4 h-4 mr-2" />
                              {transcript ? "Retry Speaking" : "Start Speaking"}
                            </Button>
                            <Button
                              className="h-10 bg-emerald-600/50 hover:bg-emerald-500/60 text-white w-24"
                              onClick={handleSubmitFeynman}
                              disabled={submittingFeynman || !transcript.trim()}
                            >
                              {submittingFeynman ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                            </Button>
                          </div>
                        </>
                      )}
                  </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
