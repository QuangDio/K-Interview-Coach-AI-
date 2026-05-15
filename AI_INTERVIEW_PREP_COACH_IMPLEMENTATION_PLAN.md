# AI Interview Prep Coach - Implementation Plan

## 1. Muc Tieu

Xay dung mot web application AI dong vai tro huan luyen vien phong van cho ung vien Viet Nam, tap trung vao:

- Luyen phong van bang tieng Anh.
- Cai thien cach tra loi cau hoi behavioral va technical screening.
- Dua feedback ve noi dung, cau truc cau tra loi, do ro rang cua tieng Anh va muc do phu hop voi phong cach phong van cua cong ty muc tieu.
- Ho tro cac phong cach phong van khac nhau nhu Global, Han Quoc, Nhat Ban, Au My.

MVP can cho phep nguoi dung tao mot buoi phong van mo phong, tra loi 5 cau hoi bang giong noi hoac text, sau do nhan report chi tiet cho tung cau tra loi.

## 2. Doi Tuong Nguoi Dung

Nguoi dung chinh:

- Lap trinh vien, ky su, nhan su van phong Viet Nam dang ung tuyen vao cong ty nuoc ngoai.
- Ung vien can luyen phan xa phong van bang tieng Anh.
- Ung vien chua quen cach tra loi co cau truc, dac biet voi behavioral questions.

Pain points:

- Thieu moi truong thuc hanh phong van thuc te bang tieng Anh.
- Khong biet cau tra loi cua minh co dung trong tam hay khong.
- Yeu phan xa khi bi hoi cau follow-up hoac cau tinh huong.
- Chua quen voi ky vong giao tiep cua cong ty global, cong ty Han Quoc hoac cong ty Nhat Ban.

## 3. Scope MVP

MVP chi tap trung vao mot workflow hoan chinh, chay duoc end-to-end.

### Included

- Tao interview session moi.
- Nhap role, seniority, target company style va job description/CV text tuy chon.
- AI generate 5 cau hoi phong van.
- AI doc cau hoi bang Text-to-Speech.
- Nguoi dung tra loi bang audio recording hoac text input.
- Speech-to-Text cho audio answer.
- AI danh gia tung cau tra loi.
- Report cuoi buoi gom diem tong quan, diem tung cau, loi chinh va cau tra loi goi y.
- Luu lich su interview session va report.

### Excluded Trong MVP

- Phan tich bieu cam khuon mat.
- Body language analysis.
- Bang xep hang.
- Payment/subscription.
- Real-time interruption nhu phong van live hai chieu.
- Pronunciation scoring chuyen sau theo phoneme.
- Mobile app native.

## 4. Tieu Chi Thanh Cong Cua MVP

MVP duoc xem la hoan thanh khi:

- User co the tao mot session phong van moi trong duoi 1 phut.
- He thong generate duoc 5 cau hoi dua tren role va target style.
- User co the tra loi it nhat 5 cau bang audio hoac text.
- Audio answer duoc transcribe thanh text.
- He thong tra report trong vong 60 giay sau khi ket thuc session.
- Report gom feedback cu the cho tung cau hoi, khong chi la nhan xet chung chung.
- Session va report duoc luu lai de user xem lai.

## 5. Tech Stack De Xuat

### Frontend

- Framework: Next.js.
- Styling: Tailwind CSS.
- UI: shadcn/ui neu duoc phep, hoac component tu viet bang Tailwind.
- Audio recording: Web Audio API hoac MediaRecorder API.

### Backend

- Next.js API routes/server actions cho MVP.
- Khi san pham lon hon, co the tach backend thanh FastAPI hoac NestJS.

### Database

- PostgreSQL.
- ORM: Prisma.

### Storage

- Development: luu audio local trong thu muc server-controlled.
- Production: S3-compatible storage nhu AWS S3, Cloudflare R2 hoac Supabase Storage.

### AI Services

- LLM: OpenAI GPT-4o hoac model OpenAI moi hon tuong duong.
- STT: OpenAI transcription API.
- TTS: OpenAI TTS.
- Feedback format: structured JSON output de UI render on dinh.

Ly do chot stack nay:

- Next.js giup lam nhanh full-stack MVP.
- PostgreSQL + Prisma de quan ly du lieu co cau truc ro rang.
- OpenAI STT/TTS/LLM giup giam do phuc tap integration trong giai do dau.

## 6. Kien Truc Tong Quan

Flow chinh:

1. User tao interview session tren frontend.
2. Frontend gui role, seniority, target style, CV/job description text len backend.
3. Backend goi LLM de tao danh sach cau hoi.
4. Frontend hien thi phong phong van ao.
5. Voi moi cau hoi:
   - Backend tao audio TTS cho cau hoi.
   - Frontend phat audio cho user.
   - User tra loi bang ghi am hoac text.
   - Neu audio, frontend upload file len backend.
   - Backend goi STT de transcribe.
   - Backend luu transcript.
6. Sau khi xong tat ca cau hoi, backend goi LLM de danh gia toan bo session.
7. Backend luu report vao database.
8. Frontend hien thi report.

## 7. Data Model

### User

- id
- email
- name
- createdAt
- updatedAt

### InterviewSession

- id
- userId
- roleTitle
- seniority
- targetCompanyStyle
- language
- cvText
- jobDescription
- status: draft | active | processing | completed | failed
- overallScore
- createdAt
- updatedAt

### InterviewQuestion

- id
- sessionId
- orderIndex
- questionText
- questionType: behavioral | technical | culture_fit | communication
- expectedSignal
- ttsAudioUrl
- createdAt

### InterviewAnswer

- id
- sessionId
- questionId
- answerText
- transcriptText
- audioUrl
- durationSeconds
- createdAt

### AnswerFeedback

- id
- answerId
- relevanceScore
- structureScore
- englishClarityScore
- cultureFitScore
- strengths
- issues
- improvedAnswer
- starAnalysis
- cultureTip
- createdAt

### SessionReport

- id
- sessionId
- overallScore
- summary
- topStrengths
- topWeaknesses
- nextPracticeFocus
- createdAt

## 8. API Design

### POST /api/interview-sessions

Tao session moi.

Request:

```json
{
  "roleTitle": "Senior Frontend Developer",
  "seniority": "senior",
  "targetCompanyStyle": "korean_company",
  "language": "english",
  "cvText": "...",
  "jobDescription": "..."
}
```

Response:

```json
{
  "sessionId": "session_123",
  "status": "draft"
}
```

### POST /api/interview-sessions/:id/questions

Generate cau hoi cho session.

Response:

```json
{
  "questions": [
    {
      "id": "question_1",
      "questionText": "Tell me about a time you handled pressure at work.",
      "questionType": "behavioral"
    }
  ]
}
```

### POST /api/questions/:id/tts

Tao audio cho cau hoi.

Response:

```json
{
  "audioUrl": "/audio/question_1.mp3"
}
```

### POST /api/questions/:id/answers

Gui cau tra loi dang text hoac audio.

Request voi text:

```json
{
  "answerText": "In my previous project..."
}
```

Request voi audio:

```http
multipart/form-data
audio: answer.webm
```

Response:

```json
{
  "answerId": "answer_123",
  "transcriptText": "In my previous project..."
}
```

### POST /api/interview-sessions/:id/evaluate

Danh gia toan bo session.

Response:

```json
{
  "reportId": "report_123",
  "overallScore": 78,
  "status": "completed"
}
```

### GET /api/interview-sessions/:id/report

Lay report chi tiet.

Response:

```json
{
  "overallScore": 78,
  "summary": "...",
  "answers": [
    {
      "questionText": "...",
      "transcriptText": "...",
      "feedback": {
        "relevanceScore": 8,
        "structureScore": 7,
        "englishClarityScore": 7,
        "cultureFitScore": 8,
        "issues": ["Answer was too general."],
        "improvedAnswer": "..."
      }
    }
  ]
}
```

## 9. AI Prompt Strategy

### Question Generation Prompt

Input:

- Role title.
- Seniority.
- Target company style.
- Job description.
- CV summary.

Output phai la JSON:

```json
{
  "questions": [
    {
      "questionText": "...",
      "questionType": "behavioral",
      "expectedSignal": "Tests communication under pressure."
    }
  ]
}
```

Rules:

- Generate dung 5 cau hoi cho MVP.
- It nhat 2 behavioral questions.
- It nhat 1 culture-fit question.
- Neu co job description/CV, cau hoi phai lien quan toi kinh nghiem cua user.
- Khong dung stereotype ve quoc gia/con nguoi. Chi dua tren professional communication expectations.

### Evaluation Prompt

Input:

- Session metadata.
- Question list.
- Answer transcripts.

Output phai la JSON:

```json
{
  "overallScore": 78,
  "summary": "...",
  "topStrengths": ["..."],
  "topWeaknesses": ["..."],
  "nextPracticeFocus": ["..."],
  "answerFeedback": [
    {
      "questionId": "...",
      "relevanceScore": 8,
      "structureScore": 7,
      "englishClarityScore": 7,
      "cultureFitScore": 8,
      "strengths": ["..."],
      "issues": ["..."],
      "starAnalysis": {
        "situation": "present | missing | weak",
        "task": "present | missing | weak",
        "action": "present | missing | weak",
        "result": "present | missing | weak"
      },
      "improvedAnswer": "...",
      "cultureTip": "..."
    }
  ]
}
```

Evaluation criteria:

- Relevance: cau tra loi co tra loi dung cau hoi khong.
- Structure: co dung logic nhu STAR, problem-action-result hay khong.
- English clarity: ngu phap, tu vung, do de hieu.
- Culture fit: co phu hop voi professional style da chon khong.

## 10. UI Screens

### 1. Dashboard

- Nut tao interview moi.
- Danh sach session gan day.
- Trang thai session: completed, processing, failed.

### 2. New Interview Setup

Fields:

- Role title.
- Seniority.
- Target company style.
- Interview language.
- Job description optional.
- CV text optional.

Primary action:

- Start interview.

### 3. Interview Room

Thanh phan chinh:

- Current question.
- Audio playback button.
- Timer suy nghi 10 giay.
- Record button.
- Text fallback input.
- Next question button.
- Progress indicator: question 1/5.

States:

- Loading question.
- Playing question audio.
- Waiting for answer.
- Recording.
- Uploading/transcribing.
- Ready for next question.

### 4. Processing Report

- Hien thi trang thai dang tong hop feedback.
- Neu qua 60 giay, hien thi thong bao van dang xu ly va cho user refresh.

### 5. Report Detail

- Overall score.
- Summary.
- Top strengths.
- Top weaknesses.
- Next practice focus.
- Bang feedback tung cau:
  - Question.
  - User transcript.
  - Scores.
  - Issues.
  - Improved answer.
  - Culture tip.

## 11. Privacy, Security, Data Retention

Du lieu nhay cam:

- CV text.
- Job description co the chua thong tin cong ty.
- Audio answer.
- Transcript.
- Feedback report.

Yeu cau MVP:

- Khong public audio URL.
- Gioi han kich thuoc file audio upload.
- Gioi han thoi luong moi cau tra loi, vi du 2 phut.
- Cho phep user xoa session.
- Khong log raw CV/audio/transcript vao application logs.
- Dung environment variables cho API keys.
- Validation input o backend.

Production requirements:

- HTTPS.
- Encryption at rest cho database/storage neu co.
- Retention policy: mac dinh giu audio 30 ngay, transcript/report cho den khi user xoa.
- Consent notice truoc khi ghi am.

## 12. Cost Va Latency Control

Gioi han MVP:

- Moi session co 5 cau hoi.
- Moi answer audio toi da 2 phut.
- Chi evaluate sau khi user hoan thanh tat ca cau hoi.
- TTS chi tao khi question duoc hien thi, hoac cache theo question.
- Luu transcript de khong goi STT lai.

Rui ro chi phi:

- STT tinh theo audio length.
- TTS tinh theo characters.
- LLM evaluation co the ton token neu CV/job description dai.

Bien phap:

- Gioi han CV/job description input.
- Tom tat CV truoc khi generate question neu qua dai.
- Dung structured output ngan gon.
- Dat rate limit theo user/session.

## 13. Development Milestones

### Milestone 1: Project Foundation

- Setup Next.js app.
- Setup Tailwind CSS.
- Setup Prisma + PostgreSQL.
- Tao schema database.
- Setup env config.
- Tao layout co dashboard va setup form.

Done khi:

- App chay local.
- Co database migration.
- Tao duoc interview session tu UI.

### Milestone 2: Question Generation

- Tao API generate questions.
- Tich hop LLM.
- Luu questions vao database.
- Hien thi interview room voi question list.

Done khi:

- User tao session va nhan 5 cau hoi.
- Questions duoc luu va xem lai duoc.

### Milestone 3: Answer Collection

- Them text answer input.
- Them audio recording bang MediaRecorder.
- Upload audio len backend.
- Luu answer va audio metadata.

Done khi:

- User tra loi duoc 5 cau bang text hoac audio.
- Backend luu duoc answer records.

### Milestone 4: STT Integration

- Goi transcription API cho audio.
- Luu transcript.
- Hien thi transcript cho user confirm hoac edit.

Done khi:

- Audio answer co transcript.
- User co the sua transcript neu STT sai.

### Milestone 5: Evaluation And Report

- Tao evaluation API.
- Goi LLM voi structured output.
- Luu AnswerFeedback va SessionReport.
- Tao report detail UI.

Done khi:

- User hoan thanh session va xem report chi tiet.

### Milestone 6: Polish And Reliability

- Loading/error states.
- Input validation.
- Rate limit co ban.
- Delete session.
- Privacy notice cho recording.
- Basic tests.

Done khi:

- Workflow chay end-to-end on dinh.
- Loi API duoc hien thi ro rang.
- User co the xoa session.

## 14. Testing Plan

### Unit Tests

- Validate input tao session.
- Parse structured JSON tu LLM.
- Tinh overall score tu answer feedback.
- Validate audio file size/duration metadata.

### Integration Tests

- Tao session -> generate questions.
- Submit text answer -> evaluate session.
- Submit audio answer -> transcribe -> evaluate session.

### Manual QA

- Tao session voi role Frontend Developer.
- Tao session voi target style Korean company.
- Tra loi bang text.
- Tra loi bang audio.
- Kiem tra report tung cau.
- Kiem tra case STT fail.
- Kiem tra case LLM return invalid JSON.
- Kiem tra xoa session.

## 15. Rui Ro Va Cach Giam Thieu

### STT Khong Chinh Xac

Rui ro:

- Accent Viet Nam co the lam transcript sai.

Giam thieu:

- Cho user edit transcript truoc khi evaluate.
- Hien thi confidence neu provider ho tro.

### Feedback Chung Chung

Rui ro:

- LLM dua nhan xet chung chung, khong co gia tri.

Giam thieu:

- Bat output theo rubric ro rang.
- Yeu cau moi issue phai gan voi mot doan trong answer.
- Luu prompt version de debug.

### Cultural Feedback Thanh Stereotype

Rui ro:

- Feedback ve "cong ty Han Quoc" co the bi ap dat hoac thieu tinh te.

Giam thieu:

- Dung ngon ngu "professional communication style" thay vi khang dinh ve con nguoi/quoc gia.
- Cho phep user chon style nhu direct, hierarchical, consensus-driven, global startup.
- Neu noi ve culture, chi dua ra goi y hanh vi trong phong van.

### Chi Phi API Cao

Rui ro:

- Moi session dung TTS, STT, LLM nen chi phi tang nhanh.

Giam thieu:

- Gioi han free usage.
- Cache TTS.
- Gioi han audio length.
- Dung model nho hon cho mot so task neu chat luong chap nhan duoc.

### Latency Cao

Rui ro:

- User doi lau khi generate report.

Giam thieu:

- Xu ly evaluation bat dong bo.
- Hien thi processing state.
- Luu partial progress.

## 16. Backlog Sau MVP

- Pronunciation scoring nang cao bang service chuyen dung.
- Personalized training roadmap.
- Interview mode theo job family: frontend, backend, QA, PM, sales.
- Follow-up questions dua tren cau tra loi cua user.
- Camera/body language analysis.
- Export report PDF.
- Share report voi mentor.
- Subscription/payment.
- Admin dashboard de quan ly prompt va rubric.

## 17. De Xuat Thu Tu Bat Dau

Thu tu nen lam:

1. Tao Next.js project va UI skeleton.
2. Thiet ke Prisma schema.
3. Lam flow tao session va generate questions.
4. Lam interview room voi text answer truoc.
5. Lam evaluation report bang text answer.
6. Them audio recording va STT sau khi text flow da on.
7. Them TTS cuoi cung de hoan thien trai nghiem phong van.

Ly do:

- Text-only flow giup validate core product nhanh nhat.
- Audio/STT/TTS lam tang complexity, nen them sau khi question/evaluation/report da dung.
- Neu feedback khong huu ich, audio experience co tot cung khong cuu duoc san pham.

