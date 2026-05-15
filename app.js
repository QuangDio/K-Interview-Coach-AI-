const STORAGE_KEY = "ai-interview-coach-sessions-v1";

const state = {
  sessions: loadSessions(),
  activeSession: null,
  reportSession: null,
  activeQuestionIndex: 0,
  mediaRecorder: null,
  micStream: null,
  cameraStream: null,
  cameraContext: null,
  motionCoach: {
    frameId: null,
    canvas: document.createElement("canvas"),
    previousFrame: null,
    samples: [],
    lastUpdate: 0,
  },
  audioChunks: [],
  recognition: null,
  recognitionShouldRun: false,
  recognitionRestartTimer: null,
  recognitionFinalTranscript: "",
  questionStartedAt: null,
  questionTimer: null,
};

const questionBank = {
  korean_company: [
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you worked under pressure and still delivered a reliable result.",
      expectedSignal: "Shows discipline, ownership, clear priorities, and calm execution.",
    },
    {
      questionType: "culture_fit",
      questionText: "How do you communicate disagreement with a senior stakeholder while staying respectful and direct?",
      expectedSignal: "Shows professional respect, clear reasoning, and solution-oriented communication.",
    },
    {
      questionType: "behavioral",
      questionText: "Describe a situation where your manager gave urgent feedback. What did you do next?",
      expectedSignal: "Shows coachability, fast response, and accountability.",
    },
    {
      questionType: "technical",
      questionText: "Walk me through a complex project you delivered. What was your role, and what trade-offs did you make?",
      expectedSignal: "Shows ownership, technical judgment, and business awareness.",
    },
    {
      questionType: "communication",
      questionText: "Please summarize your strongest experience for this role in two minutes.",
      expectedSignal: "Shows concise English communication and relevance to the role.",
    },
  ],
  global_startup: [
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you solved an ambiguous problem with limited guidance.",
      expectedSignal: "Shows autonomy, product thinking, and ability to move fast.",
    },
    {
      questionType: "technical",
      questionText: "What technical decision are you proud of, and what would you change now?",
      expectedSignal: "Shows reflection and technical maturity.",
    },
    {
      questionType: "communication",
      questionText: "How do you explain a technical trade-off to a non-technical teammate?",
      expectedSignal: "Shows clarity and stakeholder empathy.",
    },
    {
      questionType: "behavioral",
      questionText: "Describe a time you had to learn something quickly to unblock a project.",
      expectedSignal: "Shows learning speed and execution.",
    },
    {
      questionType: "culture_fit",
      questionText: "How do you decide what to prioritize when everything feels urgent?",
      expectedSignal: "Shows prioritization and impact focus.",
    },
  ],
  japanese_company: [
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you improved a process or reduced mistakes in your team.",
      expectedSignal: "Shows care, consistency, and continuous improvement.",
    },
    {
      questionType: "culture_fit",
      questionText: "How do you make sure your work is well documented and easy for others to continue?",
      expectedSignal: "Shows reliability and team coordination.",
    },
    {
      questionType: "technical",
      questionText: "Describe a bug that was difficult to diagnose. How did you find the root cause?",
      expectedSignal: "Shows patience, methodical analysis, and quality mindset.",
    },
    {
      questionType: "communication",
      questionText: "How do you report progress when a task is blocked?",
      expectedSignal: "Shows transparency and structured updates.",
    },
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you received detailed feedback and improved your work.",
      expectedSignal: "Shows humility and follow-through.",
    },
  ],
  us_eu_company: [
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you influenced a decision without having formal authority.",
      expectedSignal: "Shows collaboration and persuasive communication.",
    },
    {
      questionType: "technical",
      questionText: "Describe a technical trade-off you made between speed, quality, and maintainability.",
      expectedSignal: "Shows balanced engineering judgment.",
    },
    {
      questionType: "culture_fit",
      questionText: "How do you handle direct feedback from teammates?",
      expectedSignal: "Shows openness, maturity, and action.",
    },
    {
      questionType: "communication",
      questionText: "Explain your recent project as if I were a product manager.",
      expectedSignal: "Shows clear, audience-aware communication.",
    },
    {
      questionType: "behavioral",
      questionText: "Tell me about a time you made a mistake at work. What did you learn?",
      expectedSignal: "Shows accountability and growth mindset.",
    },
  ],
};

const styleLabels = {
  korean_company: "Korean company",
  global_startup: "Global startup",
  japanese_company: "Japanese company",
  us_eu_company: "US/EU company",
};

const els = {
  views: document.querySelectorAll(".view"),
  navItems: document.querySelectorAll(".nav-item"),
  dashboardView: document.getElementById("dashboardView"),
  setupView: document.getElementById("setupView"),
  interviewView: document.getElementById("interviewView"),
  reportView: document.getElementById("reportView"),
  historyView: document.getElementById("historyView"),
  setupForm: document.getElementById("setupForm"),
  newInterviewTop: document.getElementById("newInterviewTop"),
  homeStartPractice: document.getElementById("homeStartPractice"),
  metricSessions: document.getElementById("metricSessions"),
  metricAverage: document.getElementById("metricAverage"),
  metricBest: document.getElementById("metricBest"),
  recentSessions: document.getElementById("recentSessions"),
  dashboardCameraPreview: document.getElementById("dashboardCameraPreview"),
  dashboardCameraPlaceholder: document.getElementById("dashboardCameraPlaceholder"),
  dashboardCameraToggle: document.getElementById("dashboardCameraToggle"),
  dashboardCameraStatus: document.getElementById("dashboardCameraStatus"),
  historyList: document.getElementById("historyList"),
  clearHistory: document.getElementById("clearHistory"),
  loadDemoReport: document.getElementById("loadDemoReport"),
  loadDemoFromInterview: document.getElementById("loadDemoFromInterview"),
  sessionMeta: document.getElementById("sessionMeta"),
  questionTitle: document.getElementById("questionTitle"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  questionTimer: document.getElementById("questionTimer"),
  questionType: document.getElementById("questionType"),
  questionText: document.getElementById("questionText"),
  expectedSignal: document.getElementById("expectedSignal"),
  voiceInterviewBtn: document.getElementById("voiceInterviewBtn"),
  speakQuestion: document.getElementById("speakQuestion"),
  recordBtn: document.getElementById("recordBtn"),
  stopBtn: document.getElementById("stopBtn"),
  recordState: document.getElementById("recordState"),
  answerAudio: document.getElementById("answerAudio"),
  answerText: document.getElementById("answerText"),
  cameraPreview: document.getElementById("cameraPreview"),
  cameraPlaceholder: document.getElementById("cameraPlaceholder"),
  cameraToggle: document.getElementById("cameraToggle"),
  cameraStatus: document.getElementById("cameraStatus"),
  gestureScore: document.getElementById("gestureScore"),
  gestureMeter: document.getElementById("gestureMeter"),
  gestureFeedback: document.getElementById("gestureFeedback"),
  gestureDetail: document.getElementById("gestureDetail"),
  saveAnswer: document.getElementById("saveAnswer"),
  finishInterview: document.getElementById("finishInterview"),
  reportContent: document.getElementById("reportContent"),
  backToDashboard: document.getElementById("backToDashboard"),
};

init();

function init() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => showView(item.dataset.view));
  });

  els.newInterviewTop?.addEventListener("click", () => showView("setup"));
  els.homeStartPractice?.addEventListener("click", () => showView("setup"));
  els.backToDashboard?.addEventListener("click", () => showView("dashboard"));
  els.setupForm?.addEventListener("submit", startInterview);
  els.voiceInterviewBtn?.addEventListener("click", askAndStartSpeaking);
  els.speakQuestion?.addEventListener("click", speakCurrentQuestion);
  els.recordBtn?.addEventListener("click", () => startRecording({ clearAnswer: true }));
  els.stopBtn?.addEventListener("click", stopRecording);
  els.dashboardCameraToggle?.addEventListener("click", () => toggleCameraPreview("dashboard"));
  els.cameraToggle?.addEventListener("click", () => toggleCameraPreview("interview"));
  els.saveAnswer?.addEventListener("click", saveAnswerAndContinue);
  els.finishInterview?.addEventListener("click", finishInterview);
  els.clearHistory?.addEventListener("click", clearHistory);
  els.reportContent?.addEventListener("click", handleReportClick);
  els.loadDemoReport?.addEventListener("click", loadDemoReport);
  els.loadDemoFromInterview?.addEventListener("click", loadDemoReport);

  renderDashboard();
  renderHistory();
}

function showView(viewName) {
  els.views.forEach((view) => view.classList.remove("active-view"));
  document.getElementById(`${viewName}View`).classList.add("active-view");
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewName));

  if (viewName !== "interview") stopCameraPreview();

  if (viewName === "dashboard") renderDashboard();
  if (viewName === "history") renderHistory();
}

function startInterview(event) {
  event.preventDefault();

  const form = new FormData(els.setupForm);
  const roleTitle = String(form.get("roleTitle") || "Frontend Developer").trim();
  const seniority = String(form.get("seniority") || "middle");
  const targetStyle = String(form.get("targetStyle") || "global_startup");
  const practiceLanguage = String(form.get("practiceLanguage") || "english");
  const difficulty = String(form.get("difficulty") || "intermediate");
  const interviewType = String(form.get("interviewType") || "hr");
  const jobDescription = document.getElementById("jobDescription").value.trim();
  const cvText = document.getElementById("cvText").value.trim();

  const baseQuestions = questionBank[targetStyle] || questionBank.global_startup;
  const questions = baseQuestions.map((question, index) => ({
    id: createId(),
    orderIndex: index,
    ...question,
    questionText: adaptQuestion(question.questionText, roleTitle, seniority, jobDescription, cvText),
  }));

  state.activeSession = {
    id: createId(),
    roleTitle,
    seniority,
    targetStyle,
    practiceLanguage,
    difficulty,
    interviewType,
    jobDescription,
    cvText,
    questions,
    answers: [],
    report: null,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  state.activeQuestionIndex = 0;
  renderQuestion();
  showView("interview");
}

function adaptQuestion(question, roleTitle, seniority, jobDescription, cvText) {
  let adapted = question.replace("this role", `the ${roleTitle} role`);
  const interviewType = document.getElementById("interviewType")?.value || "hr";
  const difficulty = document.getElementById("difficulty")?.value || "intermediate";
  const practiceLanguage = document.getElementById("practiceLanguage")?.value || "english";

  const typePrefix = {
    hr: "",
    english: "Answer in clear professional English. ",
    korean_culture: "Focus on Korean company culture, respect, teamwork, and responsibility. ",
    technical: "Include technical decisions, trade-offs, and engineering impact. ",
  }[interviewType] || "";

  const difficultySuffix = {
    beginner: " Keep your answer simple and structured.",
    intermediate: " Use one concrete example.",
    advanced: " Include trade-offs, measurable impact, and stakeholder communication.",
  }[difficulty] || "";

  if (typePrefix) adapted = `${typePrefix}${adapted}`;
  if (question.includes("recent project") && cvText) {
    adapted = `Based on your profile, ${question.charAt(0).toLowerCase()}${question.slice(1)}`;
  }
  if (question.includes("complex project") && jobDescription) {
    adapted = `${question} Please connect your answer to the ${roleTitle} responsibilities.`;
  }
  if (seniority === "lead" && question.includes("project")) {
    adapted += " Include how you aligned people, not only the technical work.";
  }
  if (practiceLanguage === "mixed") adapted += " Mention any cultural communication point that would matter in a Korean company.";
  adapted += difficultySuffix;
  return adapted;
}

function renderQuestion() {
  const session = state.activeSession;
  const question = session.questions[state.activeQuestionIndex];
  const total = session.questions.length;
  const number = state.activeQuestionIndex + 1;

  resetVoiceState();
  stopQuestionTimer();
  els.sessionMeta.textContent = `${styleLabels[session.targetStyle]} • ${session.seniority} • ${session.roleTitle}`;
  els.questionTitle.textContent = `Question ${number}`;
  els.progressText.textContent = `${number}/${total}`;
  els.progressBar.style.width = `${(number / total) * 100}%`;
  els.questionType.textContent = question.questionType.replace("_", " ");
  els.questionText.textContent = question.questionText;
  els.expectedSignal.textContent = question.expectedSignal;
  els.answerText.value = getExistingAnswer(question.id)?.transcriptText || "";
  els.answerAudio.hidden = true;
  els.answerAudio.removeAttribute("src");
  els.recordState.textContent = "Use audio or type your answer.";
  els.cameraStatus.textContent =
    state.cameraStream && state.cameraContext === "interview"
      ? "Camera is on. Keep your hands inside the frame."
      : "Camera is off.";
  startQuestionTimer();
}

function startQuestionTimer() {
  stopQuestionTimer();
  state.questionStartedAt = Date.now();
  updateQuestionTimer();
  state.questionTimer = window.setInterval(updateQuestionTimer, 1000);
}

function stopQuestionTimer() {
  if (state.questionTimer) window.clearInterval(state.questionTimer);
  state.questionTimer = null;
}

function updateQuestionTimer() {
  if (!els.questionTimer || !state.questionStartedAt) return;
  const seconds = Math.floor((Date.now() - state.questionStartedAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  els.questionTimer.textContent = `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function speakCurrentQuestion() {
  const question = state.activeSession?.questions[state.activeQuestionIndex];
  if (!question || !("speechSynthesis" in window)) {
    els.recordState.textContent = "Text-to-Speech is not supported in this browser.";
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(question.questionText);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function askAndStartSpeaking() {
  const question = state.activeSession?.questions[state.activeQuestionIndex];
  if (!question) return;

  if (!("speechSynthesis" in window)) {
    els.recordState.textContent = "AI voice is unavailable. Starting microphone only.";
    startRecording({ clearAnswer: true });
    return;
  }

  if (state.mediaRecorder?.state === "recording") return;

  els.answerText.value = "";
  window.speechSynthesis.cancel();
  els.recordState.textContent = "AI is asking the question...";
  const micReady = prepareMicrophoneStream().catch(() => null);
  const utterance = new SpeechSynthesisUtterance(question.questionText);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.onend = () => {
    els.recordState.textContent = "Your turn. Speak now.";
    startRecording({ clearAnswer: true, streamPromise: micReady });
  };
  utterance.onerror = () => {
    els.recordState.textContent = "AI voice failed. Starting microphone only.";
    startRecording({ clearAnswer: true, streamPromise: micReady });
  };
  window.speechSynthesis.speak(utterance);
}

async function startRecording(options = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    els.recordState.textContent = "Audio recording is not supported in this browser.";
    return;
  }

  try {
    resetVoiceState({ keepAnswer: !options.clearAnswer, keepMic: Boolean(options.streamPromise), keepTimer: true });
    if (options.clearAnswer) els.answerText.value = "";
    state.recognitionFinalTranscript = els.answerText.value.trim();
    state.audioChunks = [];
    els.recordBtn.classList.add("recording");
    els.recordBtn.disabled = true;
    els.stopBtn.disabled = false;
    els.recordState.textContent = "Listening...";
    startBrowserSpeechRecognition({ resetFinal: true });

    const stream = options.streamPromise ? await options.streamPromise : await prepareMicrophoneStream();
    if (!stream) {
      if (state.recognitionShouldRun) {
        els.recordState.textContent = "Listening for transcript. Audio recording is unavailable.";
      } else {
        els.recordBtn.classList.remove("recording");
        els.recordBtn.disabled = false;
        els.stopBtn.disabled = true;
      }
      return;
    }
    state.audioChunks = [];
    state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) state.audioChunks.push(event.data);
    });
    state.mediaRecorder.addEventListener("stop", () => {
      const blob = new Blob(state.audioChunks, { type: "audio/webm" });
      els.answerAudio.src = URL.createObjectURL(blob);
      els.answerAudio.hidden = false;
      releaseMicrophoneStream();
    });

    if (!state.recognitionShouldRun) {
      releaseMicrophoneStream();
      return;
    }

    state.mediaRecorder.start(250);
    els.recordState.textContent = "Recording. Speak now.";
  } catch (error) {
    els.recordState.textContent = state.recognitionShouldRun
      ? "Listening for transcript. Audio recording is unavailable."
      : "Microphone permission was denied or unavailable.";
  }
}

function stopRecording() {
  if (state.mediaRecorder?.state === "recording") {
    state.mediaRecorder.stop();
  }
  stopBrowserSpeechRecognition();
  els.recordBtn.classList.remove("recording");
  els.recordBtn.disabled = false;
  els.stopBtn.disabled = true;
  els.recordState.textContent = "Recording saved. Edit transcript if needed.";
}

function prepareMicrophoneStream() {
  if (state.micStream?.active) return Promise.resolve(state.micStream);

  return navigator.mediaDevices
    .getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    .then((stream) => {
      state.micStream = stream;
      return stream;
    });
}

function releaseMicrophoneStream() {
  if (!state.micStream) return;
  state.micStream.getTracks().forEach((track) => track.stop());
  state.micStream = null;
}

function startBrowserSpeechRecognition(options = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    els.recordState.textContent = "Recording. Live transcript is not supported in this browser.";
    return;
  }

  if (state.recognition) return;
  if (options.resetFinal) state.recognitionFinalTranscript = els.answerText.value.trim();
  state.recognitionShouldRun = true;
  window.clearTimeout(state.recognitionRestartTimer);

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    els.recordState.textContent = "Listening. Start speaking.";
  };

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        state.recognitionFinalTranscript = `${state.recognitionFinalTranscript} ${text}`.trim();
      }
      else interim += text;
    }
    els.answerText.value = `${state.recognitionFinalTranscript} ${interim}`.trim();
    els.recordState.textContent = interim ? "Listening. Keep speaking." : "Voice captured.";
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      els.recordState.textContent = "Listening. Speak a little louder or closer to the mic.";
      return;
    }

    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      state.recognitionShouldRun = false;
      els.recordState.textContent = "Microphone permission was blocked for live transcript.";
      return;
    }

    els.recordState.textContent = "Live transcript paused. Keep speaking or type your answer.";
  };

  recognition.onend = () => {
    state.recognition = null;
    if (!state.recognitionShouldRun) return;

    state.recognitionRestartTimer = window.setTimeout(() => {
      startBrowserSpeechRecognition();
    }, 150);
  };

  state.recognition = recognition;
  try {
    recognition.start();
  } catch (error) {
    state.recognition = null;
  }
}

function stopBrowserSpeechRecognition() {
  state.recognitionShouldRun = false;
  window.clearTimeout(state.recognitionRestartTimer);
  if (state.recognition) {
    state.recognition.stop();
    state.recognition = null;
  }
}

async function toggleCameraPreview(context = "interview") {
  const controls = getCameraControls(context);
  if (!controls) return;

  if (state.cameraStream) {
    const previousContext = state.cameraContext;
    stopCameraPreview();
    if (previousContext !== context) {
      window.setTimeout(() => toggleCameraPreview(context), 80);
    }
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    controls.status.textContent = "Camera preview is not supported in this browser.";
    return;
  }

  try {
    controls.status.textContent = "Requesting camera permission...";
    const stream = await requestCameraStream();

    state.cameraStream = stream;
    state.cameraContext = context;
    controls.preview.srcObject = stream;
    controls.preview.hidden = false;
    controls.placeholder.hidden = true;
    controls.toggle.textContent = "Turn Camera Off";
    await controls.preview.play();
    controls.status.textContent = "Camera is on. Keep hands visible, calm, and below shoulder height.";
    if (context === "interview") startMotionCoach(controls.preview);
  } catch (error) {
    controls.status.textContent = getCameraErrorMessage(error);
  }
}

async function requestCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 960 },
        height: { ideal: 540 },
        facingMode: "user",
      },
      audio: false,
    });
  } catch (error) {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }
}

function stopCameraPreview() {
  if (!state.cameraStream) return;

  stopMotionCoach();
  const controls = getCameraControls(state.cameraContext);
  state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
  state.cameraContext = null;

  if (!controls) return;
  controls.preview.pause();
  controls.preview.srcObject = null;
  controls.preview.hidden = true;
  controls.placeholder.hidden = false;
  controls.toggle.textContent = "Turn Camera On";
  controls.status.textContent = "Camera is off.";
}

function startMotionCoach(video) {
  stopMotionCoach();
  state.motionCoach.previousFrame = null;
  state.motionCoach.samples = [];
  updateGestureFeedback({
    score: "--",
    meter: 0,
    feedback: "Watching your gesture rhythm...",
    detail: "Answer normally for a few seconds so the coach can estimate your movement.",
  });

  const analyze = (time) => {
    state.motionCoach.frameId = requestAnimationFrame(analyze);
    if (time - state.motionCoach.lastUpdate < 260 || video.readyState < 2) return;
    state.motionCoach.lastUpdate = time;

    const sample = readMotionSample(video);
    if (!sample) return;
    state.motionCoach.samples.push(sample);
    if (state.motionCoach.samples.length > 18) state.motionCoach.samples.shift();

    updateGestureFeedback(buildGestureFeedback(state.motionCoach.samples));
  };

  state.motionCoach.frameId = requestAnimationFrame(analyze);
}

function stopMotionCoach() {
  if (state.motionCoach.frameId) cancelAnimationFrame(state.motionCoach.frameId);
  state.motionCoach.frameId = null;
  state.motionCoach.previousFrame = null;
  state.motionCoach.samples = [];
  updateGestureFeedback({
    score: "--",
    meter: 0,
    feedback: "Turn on camera to get movement feedback.",
    detail: "The coach estimates gesture rhythm from local camera frames.",
  });
}

function readMotionSample(video) {
  const width = 96;
  const height = 54;
  const canvas = state.motionCoach.canvas;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  const frame = context.getImageData(0, 0, width, height).data;
  const previous = state.motionCoach.previousFrame;
  state.motionCoach.previousFrame = new Uint8ClampedArray(frame);
  if (!previous) return null;

  let totalMotion = 0;
  let handZoneMotion = 0;
  let edgeMotion = 0;
  let activePixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const diff =
        Math.abs(frame[index] - previous[index]) +
        Math.abs(frame[index + 1] - previous[index + 1]) +
        Math.abs(frame[index + 2] - previous[index + 2]);
      const normalized = diff / 765;
      if (normalized < 0.06) continue;

      totalMotion += normalized;
      activePixels += 1;
      if (y < height * 0.7 && x > width * 0.08 && x < width * 0.92) handZoneMotion += normalized;
      if (x < width * 0.08 || x > width * 0.92 || y < height * 0.08) edgeMotion += normalized;
    }
  }

  return {
    movement: totalMotion / (width * height),
    handZoneRatio: totalMotion ? handZoneMotion / totalMotion : 0,
    edgeRatio: totalMotion ? edgeMotion / totalMotion : 0,
    activeRatio: activePixels / (width * height),
  };
}

function buildGestureFeedback(samples) {
  if (samples.length < 5) {
    return {
      score: "--",
      meter: 18,
      feedback: "Calibrating movement...",
      detail: "Keep speaking naturally with your hands visible in frame.",
    };
  }

  const movement = average(samples.map((sample) => sample.movement));
  const handZone = average(samples.map((sample) => sample.handZoneRatio));
  const edge = average(samples.map((sample) => sample.edgeRatio));
  const active = average(samples.map((sample) => sample.activeRatio));
  const variance = average(samples.map((sample) => Math.abs(sample.movement - movement)));

  let score = 82;
  let feedback = "Natural gesture rhythm";
  let detail = "Your movement is visible but controlled. Keep gestures small and return to neutral after each point.";

  if (movement < 0.003 || active < 0.006) {
    score = 58;
    feedback = "Too still";
    detail = "Use one or two small hand gestures when you introduce a key action or result.";
  } else if (movement > 0.028 || active > 0.08 || variance > 0.02) {
    score = 62;
    feedback = "Too much movement";
    detail = "Slow your hands down. Keep gestures below shoulder height and pause between points.";
  } else if (edge > 0.34) {
    score = 66;
    feedback = "Hands near edge of frame";
    detail = "Move your hands closer to the center of the camera so the interviewer can read your gestures.";
  } else if (handZone < 0.45) {
    score = 70;
    feedback = "Gestures are hard to read";
    detail = "Raise your hands slightly into the chest-level area, then keep them relaxed.";
  }

  return {
    score,
    meter: score,
    feedback,
    detail,
  };
}

function updateGestureFeedback(result) {
  if (!els.gestureScore || !els.gestureMeter || !els.gestureFeedback || !els.gestureDetail) return;
  els.gestureScore.textContent = String(result.score);
  els.gestureMeter.style.width = `${result.meter}%`;
  els.gestureFeedback.textContent = result.feedback;
  els.gestureDetail.textContent = result.detail;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getCameraControls(context) {
  if (context === "dashboard") {
    return {
      preview: els.dashboardCameraPreview,
      placeholder: els.dashboardCameraPlaceholder,
      toggle: els.dashboardCameraToggle,
      status: els.dashboardCameraStatus,
    };
  }

  return {
    preview: els.cameraPreview,
    placeholder: els.cameraPlaceholder,
    toggle: els.cameraToggle,
    status: els.cameraStatus,
  };
}

function getCameraErrorMessage(error) {
  if (error?.name === "NotAllowedError" || error?.name === "SecurityError") {
    return "Camera permission is blocked. Click the camera icon in the address bar and allow camera access.";
  }

  if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
    return "No camera was found on this device.";
  }

  if (error?.name === "NotReadableError" || error?.name === "TrackStartError") {
    return "Camera is busy in another app. Close Zoom/Teams/other camera apps and try again.";
  }

  return "Camera could not start. Refresh the page and try again.";
}

function saveAnswerAndContinue() {
  resetVoiceState({ keepAnswer: true, keepTimer: true });
  const session = state.activeSession;
  const question = session.questions[state.activeQuestionIndex];
  const transcriptText = els.answerText.value.trim();
  const durationSeconds = state.questionStartedAt ? Math.max(1, Math.floor((Date.now() - state.questionStartedAt) / 1000)) : 0;

  if (!transcriptText) {
    els.recordState.textContent = "Please type or record an answer before continuing.";
    return;
  }

  const existingIndex = session.answers.findIndex((answer) => answer.questionId === question.id);
  const answer = {
    id: existingIndex >= 0 ? session.answers[existingIndex].id : createId(),
    questionId: question.id,
    transcriptText,
    durationSeconds,
    gestureScore: normalizeGestureScore(els.gestureScore?.textContent),
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) session.answers[existingIndex] = answer;
  else session.answers.push(answer);

  if (state.activeQuestionIndex < session.questions.length - 1) {
    state.activeQuestionIndex += 1;
    renderQuestion();
  } else {
    finishInterview();
  }
}

function finishInterview() {
  resetVoiceState({ keepAnswer: true });
  stopQuestionTimer();
  const session = state.activeSession;
  if (!session) return;

  session.report = evaluateSession(session);
  session.status = "completed";
  upsertSession(session);
  renderReport(session);
  showView("report");
}

function normalizeGestureScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 70;
  return Math.max(1, Math.min(100, score));
}

function resetVoiceState(options = {}) {
  window.speechSynthesis?.cancel();
  if (!options.keepTimer) stopQuestionTimer();

  if (state.mediaRecorder?.state === "recording") {
    state.mediaRecorder.stop();
  }

  stopBrowserSpeechRecognition();
  if (!options.keepMic) releaseMicrophoneStream();
  state.audioChunks = [];
  els.recordBtn.classList.remove("recording");
  els.recordBtn.disabled = false;
  els.stopBtn.disabled = true;
  if (!options.keepAnswer) {
    els.answerAudio.hidden = true;
    els.answerAudio.removeAttribute("src");
  }
}

function loadDemoReport() {
  const questions = questionBank.korean_company.map((question, index) => ({
    id: createId(),
    orderIndex: index,
    ...question,
  }));

  const demoAnswers = [
    "I want to improve myself. I worked on a project and it was difficult.",
    "I don't know exactly, but I think I can communicate with manager.",
    "My english is not good but I try hard.",
    "We did many things in the project and the team fixed the issue.",
    "I built the feature because the deadline was close. Then I tested it and the result improved by 25%.",
  ];

  const session = {
    id: createId(),
    roleTitle: "Senior Frontend Developer",
    seniority: "senior",
    targetStyle: "korean_company",
    jobDescription: "Demo interview report",
    cvText: "Demo candidate",
    questions,
    answers: questions.map((question, index) => ({
      id: createId(),
      questionId: question.id,
      transcriptText: demoAnswers[index],
      createdAt: new Date().toISOString(),
    })),
    report: null,
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  session.report = evaluateSession(session);
  upsertSession(session);
  renderReport(session);
  showView("report");
}

function evaluateSession(session) {
  const answerFeedback = session.questions.map((question) => {
    const answer = session.answers.find((item) => item.questionId === question.id);
    return evaluateAnswer(question, answer || {}, session);
  });

  const overallScore = Math.round(
    answerFeedback.reduce((sum, item) => sum + item.averageScore, 0) / answerFeedback.length
  );

  return {
    overallScore,
    summary: buildSummary(overallScore, session),
    topStrengths: collectTop(answerFeedback, "strengths"),
    topWeaknesses: collectTop(answerFeedback, "issues"),
    nextPracticeFocus: buildPracticeFocus(answerFeedback),
    answerFeedback,
    createdAt: new Date().toISOString(),
  };
}

function evaluateAnswer(question, answer, session) {
  const text = answer?.transcriptText || "";
  const targetStyle = session.targetStyle;
  const words = text.split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  const durationSeconds = answer?.durationSeconds || 0;
  const gestureScore = normalizeGestureScore(answer?.gestureScore);
  const hasStar =
    lower.includes("situation") ||
    lower.includes("task") ||
    lower.includes("action") ||
    lower.includes("result") ||
    lower.includes("because") ||
    lower.includes("then");
  const hasOutcome =
    lower.includes("result") ||
    lower.includes("impact") ||
    lower.includes("improved") ||
    lower.includes("reduced") ||
    lower.includes("delivered") ||
    /\d/.test(text);
  const hasOwnership =
    lower.includes("i ") ||
    lower.includes("my ") ||
    lower.includes("led") ||
    lower.includes("owned") ||
    lower.includes("decided");
  const concise = words.length >= 45 && words.length <= 180;
  const cultureSignals = cultureSignalScore(lower, targetStyle);
  const fillerCount = fillerPenalty(lower);

  const contentScore = clampToMax(
    8 + keywordOverlapScore(question.questionText, text) * 2 + (words.length > 35 ? 5 : 0) + (hasOutcome ? 5 : 0) + (hasOwnership ? 3 : 0),
    25
  );
  const englishScore = clampToMax(10 + (concise ? 5 : 1) + (words.length > 25 ? 3 : 0) - fillerCount * 2, 20);
  const structureScore = clampToMax(5 + (hasStar ? 5 : 0) + (hasOutcome ? 3 : 0) + (concise ? 2 : 0), 15);
  const confidenceScore = clampToMax(6 + confidenceDurationScore(durationSeconds) + (fillerCount === 0 ? 3 : 0), 15);
  const cameraScore = clampToMax(Math.round(gestureScore / 10), 10);
  const koreanCultureScore = clampToMax(6 + cultureSignals * 3 + (hasOwnership ? 2 : 0) + (targetStyle === "korean_company" ? 1 : 0), 15);
  const averageScore = contentScore + englishScore + structureScore + confidenceScore + cameraScore + koreanCultureScore;

  const issues = [];
  const strengths = [];

  if (words.length < 45) issues.push("The answer is too short to prove your experience clearly.");
  else strengths.push("The answer has enough detail for an interviewer to assess your experience.");

  if (!hasStar) issues.push("Add clearer structure: situation, task, action, and result.");
  else strengths.push("The answer shows a visible structure instead of a random story.");

  if (!hasOutcome) issues.push("Add a measurable result or business impact.");
  else strengths.push("You included an outcome, which makes the answer more credible.");

  if (!hasOwnership) issues.push("Use more first-person ownership: what you personally decided or did.");
  else strengths.push("You communicated personal ownership.");

  if (durationSeconds && durationSeconds < 45) issues.push("The answer is short in speaking time. Aim for 60-90 seconds.");
  if (durationSeconds >= 60 && durationSeconds <= 90) strengths.push("Your answer timing is close to a strong 60-90 second interview answer.");
  if (gestureScore < 65) issues.push("Camera movement needs work: keep hands visible, calm, and centered.");
  if (gestureScore >= 75) strengths.push("Your camera behavior looks controlled enough for an online interview.");

  const mistakes = buildMistakes({
    text,
    lower,
    words,
    question,
    targetStyle,
    hasStar,
    hasOutcome,
    hasOwnership,
    concise,
  });

  return {
    questionId: question.id,
    relevanceScore: contentScore,
    structureScore,
    englishClarityScore: englishScore,
    cultureFitScore: koreanCultureScore,
    confidenceScore,
    cameraScore,
    contentScore,
    englishScore,
    koreanCultureScore,
    criteriaScores: [
      { label: "Answer content", score: contentScore, max: 25 },
      { label: "English", score: englishScore, max: 20 },
      { label: "Answer structure", score: structureScore, max: 15 },
      { label: "Speaking confidence", score: confidenceScore, max: 15 },
      { label: "Camera behavior", score: cameraScore, max: 10 },
      { label: "Korean culture fit", score: koreanCultureScore, max: 15 },
    ],
    averageScore,
    strengths: strengths.slice(0, 3),
    issues: issues.slice(0, 3),
    mistakes,
    xpAvailable: mistakes.reduce((sum, mistake) => sum + mistake.xp, 0),
    starAnalysis: {
      situation: lower.includes("situation") || words.length > 40 ? "present" : "weak",
      task: lower.includes("task") || lower.includes("responsible") ? "present" : "weak",
      action: lower.includes("action") || lower.includes("implemented") || lower.includes("built") ? "present" : "weak",
      result: hasOutcome ? "present" : "missing",
    },
    improvedAnswer: buildImprovedAnswer(question, targetStyle),
    cultureTip: buildCultureTip(targetStyle),
    durationSeconds,
    gestureScore,
    transcriptText: text || "No answer submitted.",
  };
}

function clampToMax(score, max) {
  return Math.max(0, Math.min(max, Math.round(score)));
}

function confidenceDurationScore(seconds) {
  if (!seconds) return 2;
  if (seconds >= 60 && seconds <= 90) return 6;
  if (seconds >= 45 && seconds <= 120) return 4;
  return 2;
}

function buildMistakes({ text, lower, words, question, targetStyle, hasStar, hasOutcome, hasOwnership, concise }) {
  if (!text.trim()) {
    return [
      {
        id: createId(),
        type: "Missing answer",
        severity: "high",
        snippet: "No answer submitted.",
        reason: "The interviewer cannot evaluate your skill without a concrete answer.",
        bad: "No answer submitted.",
        good: buildSuggestedAnswer(question, targetStyle),
        why: "A useful interview answer needs context, your action, and a result.",
        xp: 20,
      },
    ];
  }

  const mistakes = [];
  const firstSentence = getSentence(text, 0);
  const lastSentence = getSentence(text, -1);
  const shortSnippet = words.slice(0, Math.min(words.length, 18)).join(" ");

  if (words.length < 45) {
    mistakes.push({
      id: createId(),
      type: "Too short",
      severity: "high",
      snippet: shortSnippet,
      reason: "This answer is too short. It does not give enough proof of your experience.",
      bad: shortSnippet,
      good: buildSuggestedAnswer(question, targetStyle),
      why: "Interviewers need a specific situation, your responsibility, your action, and the result. Short generic answers sound unprepared.",
      xp: 15,
    });
  }

  if (!hasStar) {
    mistakes.push({
      id: createId(),
      type: "Weak structure",
      severity: "medium",
      snippet: firstSentence,
      reason: "The answer reads like a loose explanation instead of a structured STAR story.",
      bad: firstSentence,
      good: "In my previous project, the situation was..., my task was..., I took these actions..., and the result was...",
      why: "STAR helps the interviewer follow your logic quickly and compare your experience fairly.",
      xp: 12,
    });
  }

  if (!hasOutcome) {
    mistakes.push({
      id: createId(),
      type: "No measurable result",
      severity: "high",
      snippet: lastSentence,
      reason: "The answer does not close with a clear result or measurable impact.",
      bad: lastSentence,
      good: "As a result, we reduced release issues by 30% and delivered the feature one week before the deadline.",
      why: "A result turns your story from an opinion into evidence. Numbers, deadlines, quality improvements, or team impact all help.",
      xp: 15,
    });
  }

  if (!hasOwnership) {
    mistakes.push({
      id: createId(),
      type: "Unclear ownership",
      severity: "medium",
      snippet: firstSentence,
      reason: "The answer does not clearly say what you personally did.",
      bad: firstSentence,
      good: "I owned the investigation, aligned the team on the priority, and implemented the fix.",
      why: "Interviewers want to separate your personal contribution from the team's general work.",
      xp: 10,
    });
  }

  if (!concise && words.length > 180) {
    mistakes.push({
      id: createId(),
      type: "Too long",
      severity: "medium",
      snippet: getSentence(text, 1) || firstSentence,
      reason: "The answer is long and may lose the interviewer's attention.",
      bad: getSentence(text, 1) || firstSentence,
      good: "I would summarize the context in one sentence, focus on two actions, and close with the result.",
      why: "A strong interview answer is usually 60-120 words for one question unless the interviewer asks for more detail.",
      xp: 10,
    });
  }

  const phraseFixes = [
    {
      phrase: "i want to improve myself",
      type: "Generic motivation",
      good: "I aim to contribute to the team while developing the skills needed for this role.",
      reason: "This phrase sounds generic and self-focused.",
      why: "The improved version balances team contribution with personal growth.",
    },
    {
      phrase: "i don't know",
      type: "Weak confidence",
      good: "I have not handled that exact case yet, but I would approach it by clarifying the goal, checking constraints, and proposing the safest next step.",
      reason: "Saying only 'I don't know' stops the conversation.",
      why: "The improved version is honest while still showing problem-solving ability.",
    },
    {
      phrase: "my english is not good",
      type: "Self-negative framing",
      good: "I am continuing to improve my English, and I can communicate clearly in work situations.",
      reason: "This weakens your credibility before the interviewer evaluates you.",
      why: "The improved version is honest but keeps the focus on work communication.",
    },
  ];

  phraseFixes.forEach((fix) => {
    if (lower.includes(fix.phrase)) {
      mistakes.push({
        id: createId(),
        type: fix.type,
        severity: "high",
        snippet: findOriginalPhrase(text, fix.phrase),
        reason: fix.reason,
        bad: findOriginalPhrase(text, fix.phrase),
        good: fix.good,
        why: fix.why,
        xp: 15,
      });
    }
  });

  return mistakes.slice(0, 5);
}

function keywordOverlapScore(question, answer) {
  const qWords = new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 4)
  );
  const answerLower = answer.toLowerCase();
  let matches = 0;
  qWords.forEach((word) => {
    if (answerLower.includes(word)) matches += 1;
  });
  return Math.min(matches, 3);
}

function fillerPenalty(text) {
  const fillers = ["actually", "basically", "you know", "like ", "umm", "uhh"];
  return fillers.reduce((count, filler) => count + (text.includes(filler) ? 1 : 0), 0);
}

function cultureSignalScore(text, targetStyle) {
  const signals = {
    korean_company: ["respect", "priority", "deadline", "pressure", "manager", "team"],
    global_startup: ["impact", "customer", "fast", "learn", "experiment", "ownership"],
    japanese_company: ["quality", "document", "process", "detail", "root cause", "improve"],
    us_eu_company: ["feedback", "collaborate", "trade-off", "decision", "stakeholder", "impact"],
  };
  return Math.min((signals[targetStyle] || []).filter((signal) => text.includes(signal)).length, 2);
}

function clampScore(score) {
  return Math.max(1, Math.min(10, score));
}

function buildImprovedAnswer(question, targetStyle) {
  const styleCue = {
    korean_company: "I would keep the answer respectful, concise, and focused on priority, execution, and follow-through.",
    global_startup: "I would emphasize ambiguity, ownership, speed, and measurable customer or product impact.",
    japanese_company: "I would emphasize careful process, quality, documentation, and continuous improvement.",
    us_eu_company: "I would emphasize direct communication, collaboration, trade-offs, and measurable impact.",
  }[targetStyle];

  return `A stronger answer would start with one sentence of context, explain your specific responsibility, describe two or three concrete actions, and close with a measurable result. ${styleCue} For this question, connect the story directly to: "${question.expectedSignal}"`;
}

function buildSuggestedAnswer(question, targetStyle) {
  const styleCue = {
    korean_company: "I also kept my manager updated and focused on the agreed priority.",
    global_startup: "I made a quick decision, tested the result, and adjusted based on impact.",
    japanese_company: "I documented the root cause and improved the process to prevent repeat issues.",
    us_eu_company: "I explained the trade-off clearly and aligned stakeholders before execution.",
  }[targetStyle];

  return `In a recent project, I faced a situation related to ${question.expectedSignal.toLowerCase()} My task was to solve it without slowing the team down. I clarified the priority, took ownership of the next action, and communicated progress clearly. ${styleCue} As a result, the team delivered a more reliable outcome.`;
}

function buildCultureTip(targetStyle) {
  return {
    korean_company:
      "Show respect for senior stakeholders while still being specific about your recommendation, execution discipline, and ability to handle pressure.",
    global_startup:
      "Be direct about impact, trade-offs, and what you did without waiting for perfect instructions.",
    japanese_company:
      "Highlight quality, preparation, documentation, and how your work helped the team avoid repeated mistakes.",
    us_eu_company:
      "Use clear ownership language, explain trade-offs, and show that you can collaborate through feedback.",
  }[targetStyle];
}

function buildSummary(score, session) {
  if (score >= 80) {
    return `Strong session for a ${session.roleTitle} interview. Your answers are mostly clear, relevant, and structured.`;
  }
  if (score >= 65) {
    return `Solid base for a ${session.roleTitle} interview, but the answers need sharper structure and more measurable outcomes.`;
  }
  return `This session needs more practice. Focus on fuller answers, clearer ownership, and specific results.`;
}

function collectTop(feedback, key) {
  return feedback.flatMap((item) => item[key]).slice(0, 4);
}

function buildPracticeFocus(feedback) {
  const lowStructure = feedback.some((item) => item.structureScore < 10);
  const lowClarity = feedback.some((item) => item.englishScore < 14);
  const lowCulture = feedback.some((item) => item.koreanCultureScore < 10);
  const lowConfidence = feedback.some((item) => item.confidenceScore < 10);
  const lowCamera = feedback.some((item) => item.cameraScore < 7);
  const focus = [];
  if (lowStructure) focus.push("Practice STAR answers with a clear result sentence.");
  if (lowClarity) focus.push("Keep answers between 60 and 120 words with simpler sentence structure.");
  if (lowConfidence) focus.push("Practice answering within 60-90 seconds with fewer fillers.");
  if (lowCamera) focus.push("Keep eye contact and use calm, centered hand gestures on camera.");
  if (lowCulture) focus.push("Adapt your examples to the selected interview style.");
  if (!focus.length) focus.push("Practice follow-up questions and tougher pressure scenarios.");
  return focus;
}

function renderReport(session) {
  state.reportSession = session;
  const report = session.report;
  hydrateReportMistakes(session);
  ensureGameState(report);
  const allMistakes = getAllMistakes(report);
  const activeQuest = getActiveQuest(report);
  const totalXp = getPotentialXp(report);
  els.reportContent.innerHTML = `
    <section class="panel score-card">
      <div class="score-ring" style="--score:${report.overallScore}%"><span>${report.overallScore}</span></div>
      <div>
        <p class="eyebrow">${styleLabels[session.targetStyle]} • ${session.roleTitle}</p>
        <h2>Overall Score: ${report.overallScore}/100</h2>
        <p class="muted">${report.summary}</p>
        <p><strong>Strengths:</strong> ${escapeHtml(report.topStrengths.join(" ")) || "Keep practicing to reveal strengths."}</p>
        <p><strong>Weaknesses:</strong> ${escapeHtml(report.topWeaknesses.join(" ")) || "No major weakness detected."}</p>
        <p><strong>Recommendation:</strong> ${escapeHtml(report.nextPracticeFocus[0] || "Use the STAR method and practice answering within 60-90 seconds.")}</p>
        <button class="primary-btn" type="button" onclick="document.querySelector('[data-view=setup]').click()">Try Again</button>
        <p class="muted">Generated ${formatDate(report.createdAt)}. ${totalXp} XP available through interview repair quests.</p>
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Scoring rubric</p>
          <h2>Score by criteria</h2>
        </div>
      </div>
      <div class="feedback-grid">
        ${buildSessionCriteria(session).map((item) => scorePill(item.label, item.score, item.max)).join("")}
      </div>
    </section>

    <section class="panel quest-panel">
      <div class="quest-summary">
        <div>
          <p class="eyebrow">Repair quests</p>
          <h2>${activeQuest ? escapeHtml(activeQuest.type) : "Perfect Interview cleared"}</h2>
          <p class="muted">${
            activeQuest
              ? "Fix the active issue, earn XP, then the next issue unlocks automatically."
              : "No more active issues in this report."
          }</p>
        </div>
        <div class="xp-board">
          <div><strong>${report.gameState.xpEarned}</strong><span>XP earned</span></div>
          <div><strong>${report.gameState.completedIds.length}/${allMistakes.length}</strong><span>Quests</span></div>
          <div><strong>${report.gameState.comboStreak}</strong><span>Combo</span></div>
          <div><strong>x${report.gameState.bonusMultiplier}</strong><span>Quality bonus</span></div>
        </div>
      </div>
      <div class="quest-track">
        ${allMistakes
          .map(
            (mistake, index) => `
              <button class="quest-chip ${
                report.gameState.completedIds.includes(mistake.id) ? "done" : mistake.id === report.gameState.activeQuestId ? "active" : ""
              }" type="button" data-mistake-id="${mistake.id}">
                ${index + 1}
              </button>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Next practice focus</p>
          <h2>What to improve next</h2>
        </div>
      </div>
      <ul class="check-list">${report.nextPracticeFocus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>

    ${session.questions
      .map((question, index) => {
        const feedback = report.answerFeedback.find((item) => item.questionId === question.id);
        return `
          <article class="feedback-card">
            <p class="eyebrow">Question ${index + 1} • ${question.questionType.replace("_", " ")}</p>
            <h2>${escapeHtml(question.questionText)}</h2>
            <div class="transcript-review">
              <div class="review-heading">
                <strong>Your transcript</strong>
                <span>${feedback.mistakes?.length || 0} highlighted issues</span>
              </div>
              <p>${renderHighlightedTranscript(feedback, report)}</p>
            </div>
            <div class="feedback-grid">
              ${getCriteriaScores(feedback).map((item) => scorePill(item.label, item.score, item.max)).join("")}
            </div>
            ${renderMistakeDetails(feedback, report)}
            <p><strong>Issues:</strong> ${escapeHtml(feedback.issues.join(" ")) || "No major issue detected."}</p>
            <p><strong>Improved answer direction:</strong> ${escapeHtml(feedback.improvedAnswer)}</p>
            <p><strong>Culture tip:</strong> ${escapeHtml(feedback.cultureTip)}</p>
          </article>
        `;
      })
      .join("")}
  `;
}

function hydrateReportMistakes(session) {
  session.report.answerFeedback.forEach((feedback) => {
    if (Array.isArray(feedback.mistakes)) return;

    const question = session.questions.find((item) => item.id === feedback.questionId);
    if (!question) {
      feedback.mistakes = [];
      feedback.xpAvailable = 0;
      return;
    }

    const text = feedback.transcriptText || "";
    const words = text.split(/\s+/).filter(Boolean);
    const lower = text.toLowerCase();
    const hasStar =
      lower.includes("situation") ||
      lower.includes("task") ||
      lower.includes("action") ||
      lower.includes("result") ||
      lower.includes("because") ||
      lower.includes("then");
    const hasOutcome =
      lower.includes("result") ||
      lower.includes("impact") ||
      lower.includes("improved") ||
      lower.includes("reduced") ||
      lower.includes("delivered") ||
      /\d/.test(text);
    const hasOwnership =
      lower.includes("i ") ||
      lower.includes("my ") ||
      lower.includes("led") ||
      lower.includes("owned") ||
      lower.includes("decided");
    const concise = words.length >= 45 && words.length <= 180;

    feedback.mistakes = buildMistakes({
      text,
      lower,
      words,
      question,
      targetStyle: session.targetStyle,
      hasStar,
      hasOutcome,
      hasOwnership,
      concise,
    });
    feedback.xpAvailable = feedback.mistakes.reduce((sum, mistake) => sum + mistake.xp, 0);
  });
}

function renderHighlightedTranscript(feedback, report) {
  const text = feedback.transcriptText || "No answer submitted.";
  const mistakes = feedback.mistakes || [];
  if (!mistakes.length) return escapeHtml(text);

  let html = escapeHtml(text);
  mistakes.forEach((mistake) => {
    const snippet = mistake.snippet || "";
    if (!snippet || snippet === "No answer submitted.") return;
    const safeSnippet = escapeHtml(snippet);
    const escapedPattern = safeSnippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp(escapedPattern, "i"),
      `<button class="mistake-highlight ${mistake.severity} ${
        report.gameState.completedIds.includes(mistake.id) ? "fixed-highlight" : ""
      }" type="button" data-mistake-id="${mistake.id}">${safeSnippet}</button>`
    );
  });

  if (!html.includes("mistake-highlight") && mistakes[0]) {
    return `<button class="mistake-highlight ${mistakes[0].severity}" type="button" data-mistake-id="${mistakes[0].id}">${escapeHtml(text)}</button>`;
  }

  return html;
}

function renderMistakeDetails(feedback, report) {
  const mistakes = feedback.mistakes || [];
  if (!mistakes.length) {
    return `
      <div class="clean-answer">
        <strong>No critical highlighted mistakes.</strong>
        <p>Your answer is usable. Keep practicing with tougher follow-up questions.</p>
      </div>
    `;
  }

  return `
    <div class="mistake-list">
      ${mistakes
        .map(
          (mistake, index) => `
            <section class="mistake-detail ${
              mistake.id === report.gameState.activeQuestId ? "active" : ""
            } ${report.gameState.completedIds.includes(mistake.id) ? "fixed" : ""}" data-detail-id="${mistake.id}">
              <div class="mistake-title">
                <div>
                  <p class="eyebrow">${escapeHtml(mistake.type)}</p>
                  <h3>${escapeHtml(mistake.reason)}</h3>
                </div>
                <span>+${Math.round(mistake.xp * report.gameState.bonusMultiplier)} XP</span>
              </div>
              <div class="comparison-grid">
                <div class="bad-line">
                  <strong>Do not say</strong>
                  <p>${escapeHtml(mistake.bad)}</p>
                </div>
                <div class="good-line">
                  <strong>Say this instead</strong>
                  <p>${escapeHtml(mistake.good)}</p>
                </div>
              </div>
              <div class="why-box">
                <strong>Why this is better</strong>
                <p>${escapeHtml(mistake.why)}</p>
              </div>
              <button class="secondary-btn mark-fixed" type="button" ${
                report.gameState.completedIds.includes(mistake.id) ? "disabled" : ""
              }>${report.gameState.completedIds.includes(mistake.id) ? "Practiced" : "Mark as practiced"}</button>
            </section>
          `
        )
        .join("")}
    </div>
  `;
}

function handleReportClick(event) {
  const highlight = event.target.closest(".mistake-highlight");
  if (highlight) {
    setActiveQuest(highlight.dataset.mistakeId);
    return;
  }

  const questChip = event.target.closest(".quest-chip");
  if (questChip) {
    setActiveQuest(questChip.dataset.mistakeId);
    return;
  }

  const fixedButton = event.target.closest(".mark-fixed");
  if (fixedButton) {
    completeActiveQuest(fixedButton.closest(".mistake-detail").dataset.detailId);
  }
}

function ensureGameState(report) {
  const allMistakes = getAllMistakes(report);
  if (!report.gameState) {
    report.gameState = {
      completedIds: [],
      xpEarned: 0,
      comboStreak: 0,
      bonusMultiplier: calculateBonusMultiplier(report.overallScore, allMistakes.length),
      activeQuestId: allMistakes[0]?.id || null,
    };
  }

  report.gameState.bonusMultiplier = report.gameState.bonusMultiplier || calculateBonusMultiplier(report.overallScore, allMistakes.length);
  report.gameState.completedIds = report.gameState.completedIds || [];
  report.gameState.xpEarned = report.gameState.xpEarned || 0;
  report.gameState.comboStreak = report.gameState.comboStreak || 0;

  if (!report.gameState.activeQuestId || report.gameState.completedIds.includes(report.gameState.activeQuestId)) {
    report.gameState.activeQuestId = allMistakes.find((mistake) => !report.gameState.completedIds.includes(mistake.id))?.id || null;
  }
}

function calculateBonusMultiplier(overallScore, mistakeCount) {
  if (mistakeCount === 0) return 2;
  if (overallScore >= 90 && mistakeCount <= 2) return 2;
  if (overallScore >= 80 && mistakeCount <= 4) return 1.5;
  return 1;
}

function getAllMistakes(report) {
  return report.answerFeedback.flatMap((feedback) => feedback.mistakes || []);
}

function getPotentialXp(report) {
  return getAllMistakes(report).reduce((sum, mistake) => sum + Math.round(mistake.xp * report.gameState.bonusMultiplier), 0);
}

function getActiveQuest(report) {
  return getAllMistakes(report).find((mistake) => mistake.id === report.gameState.activeQuestId) || null;
}

function setActiveQuest(mistakeId) {
  const session = state.reportSession;
  if (!session?.report) return;
  session.report.gameState.activeQuestId = mistakeId;
  upsertSession(session);
  renderReport(session);
}

function completeActiveQuest(mistakeId) {
  const session = state.reportSession;
  if (!session?.report) return;

  const report = session.report;
  ensureGameState(report);
  const mistake = getAllMistakes(report).find((item) => item.id === mistakeId);
  if (!mistake || report.gameState.completedIds.includes(mistakeId)) return;

  report.gameState.completedIds.push(mistakeId);
  report.gameState.comboStreak += 1;
  report.gameState.xpEarned += Math.round(mistake.xp * report.gameState.bonusMultiplier);

  if (report.gameState.comboStreak > 0 && report.gameState.comboStreak % 3 === 0) {
    report.gameState.xpEarned += 10;
  }

  const nextQuest = getAllMistakes(report).find((item) => !report.gameState.completedIds.includes(item.id));
  report.gameState.activeQuestId = nextQuest?.id || null;
  upsertSession(session);
  renderReport(session);
}

function buildSessionCriteria(session) {
  const feedback = session.report.answerFeedback;
  const labels = [
    { key: "contentScore", label: "Answer content", max: 25 },
    { key: "englishScore", label: "English", max: 20 },
    { key: "structureScore", label: "Answer structure", max: 15 },
    { key: "confidenceScore", label: "Speaking confidence", max: 15 },
    { key: "cameraScore", label: "Camera behavior", max: 10 },
    { key: "koreanCultureScore", label: "Korean culture fit", max: 15 },
  ];

  return labels.map((item) => ({
    label: item.label,
    max: item.max,
    score: Math.round(feedback.reduce((sum, answer) => sum + (answer[item.key] || 0), 0) / feedback.length),
  }));
}

function getCriteriaScores(feedback) {
  if (Array.isArray(feedback.criteriaScores)) return feedback.criteriaScores;
  return [
    { label: "Answer content", score: feedback.relevanceScore || 0, max: 25 },
    { label: "English", score: feedback.englishClarityScore || 0, max: 20 },
    { label: "Answer structure", score: feedback.structureScore || 0, max: 15 },
    { label: "Speaking confidence", score: feedback.confidenceScore || 0, max: 15 },
    { label: "Camera behavior", score: feedback.cameraScore || 0, max: 10 },
    { label: "Korean culture fit", score: feedback.cultureFitScore || 0, max: 15 },
  ];
}

function scorePill(label, score, max = 10) {
  return `<div class="score-pill"><strong>${score}/${max}</strong><span>${label}</span></div>`;
}

function getSentence(text, index) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (!sentences.length) return text.trim();
  if (index === -1) return sentences[sentences.length - 1];
  return sentences[index] || sentences[0];
}

function findOriginalPhrase(text, lowerPhrase) {
  const index = text.toLowerCase().indexOf(lowerPhrase);
  if (index < 0) return lowerPhrase;
  return text.slice(index, index + lowerPhrase.length);
}

function getExistingAnswer(questionId) {
  return state.activeSession.answers.find((answer) => answer.questionId === questionId);
}

function upsertSession(session) {
  const index = state.sessions.findIndex((item) => item.id === session.id);
  if (index >= 0) state.sessions[index] = session;
  else state.sessions.unshift(session);
  saveSessions();
}

function renderDashboard() {
  const completed = state.sessions.filter((session) => session.report);
  const scores = completed.map((session) => session.report.overallScore);
  els.metricSessions.textContent = String(completed.length);
  els.metricAverage.textContent = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : "--";
  els.metricBest.textContent = scores.length ? Math.max(...scores) : "--";
  renderEnhancedSessionList(els.recentSessions, completed.slice(0, 4));

  const overviewLabel = document.querySelector(".overview-panel .eyebrow");
  if (overviewLabel) overviewLabel.textContent = "Korean interview simulator";
}

function renderHistory() {
  renderEnhancedSessionList(els.historyList, state.sessions);
}

function renderSessionList(container, sessions) {
  if (!sessions.length) {
    container.innerHTML = "No sessions yet. Start a new interview to create your first report.";
    return;
  }

  container.innerHTML = sessions
    .map(
      (session) => `
        <article class="session-item">
          <div>
            <h3>${escapeHtml(session.roleTitle)}</h3>
            <p>${styleLabels[session.targetStyle]} • ${formatDate(session.createdAt)}</p>
          </div>
          <button class="secondary-btn" type="button" data-session-id="${session.id}">View Report</button>
        </article>
      `
    )
    .join("");

  container.querySelectorAll("[data-session-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.sessions.find((item) => item.id === button.dataset.sessionId);
      if (session?.report) {
        renderReport(session);
        showView("report");
      }
    });
  });
}

function renderEnhancedSessionList(container, sessions) {
  if (!sessions.length) {
    container.innerHTML = "No sessions yet. Start a new interview to create your first report.";
    return;
  }

  container.innerHTML = sessions
    .map((session, index) => {
      const previous = sessions[index + 1];
      const score = session.report?.overallScore ?? "--";
      const delta = previous?.report && Number.isFinite(score) ? score - previous.report.overallScore : null;
      const mistakeSummary = getCommonMistakes(session).join(", ") || "No repeated issue yet";
      const progress = delta === null ? "First completed report" : delta >= 0 ? `+${delta} progress` : `${delta} regression`;

      return `
        <article class="session-item">
          <div>
            <h3>${escapeHtml(session.roleTitle)}</h3>
            <p>${styleLabels[session.targetStyle]} - ${formatDate(session.createdAt)}</p>
            <p>Score: ${score}/100 - ${progress}</p>
            <p>Common issues: ${escapeHtml(mistakeSummary)}</p>
          </div>
          <button class="secondary-btn" type="button" data-session-id="${session.id}">View Report</button>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("[data-session-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.sessions.find((item) => item.id === button.dataset.sessionId);
      if (session?.report) {
        renderReport(session);
        showView("report");
      }
    });
  });
}

function getCommonMistakes(session) {
  if (!session.report?.answerFeedback) return [];
  const counts = {};
  session.report.answerFeedback
    .flatMap((item) => item.mistakes || [])
    .forEach((mistake) => {
      counts[mistake.type] = (counts[mistake.type] || 0) + 1;
    });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
}

function clearHistory() {
  if (!confirm("Clear all saved interview sessions in this browser?")) return;
  state.sessions = [];
  saveSessions();
  renderDashboard();
  renderHistory();
}

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sessions));
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
