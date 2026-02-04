# Meeting Recording Processing

**Purpose:** Automatic transcription, speaker detection, and knowledge extraction from meeting recordings
**Trigger:** Every 15 minutes Mon-Fri 8am-7pm (VPS cron)
**Formats:** MP4, MKV, MOV, AVI, WEBM (video/audio)
**Models:** Groq Whisper (transcription) + Claude Sonnet 4 (extraction) + GPT-4 Vision (speaker detection)
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Stages](#pipeline-stages)
3. [Audio Extraction](#audio-extraction)
4. [Transcription](#transcription)
5. [Transcript Cleanup](#transcript-cleanup)
6. [Speaker Detection](#speaker-detection)
7. [Information Extraction](#information-extraction)
8. [Context Updates](#context-updates)
9. [RAG Indexing](#rag-indexing)
10. [Notifications](#notifications)
11. [Configuration](#configuration)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The meeting recording system transforms video/audio recordings into structured, searchable knowledge automatically.

### Core Value

**Problem:**
- Hours of meeting recordings with no transcript
- Action items lost in 60-minute conversations
- No way to search "what did Sarah say about the budget?"
- Decisions made verbally but not documented

**Solution:**
- Drop recording in Nextcloud → automatic processing
- Transcription with speaker names (Teams UI detection)
- AI extracts action items, decisions, topics
- Creates pending tasks via Telegram confirmation
- Updates project context files with learnings
- Makes entire transcript searchable via RAG

### Processing Pipeline

```
┌────────────────────────────────────────────────────────────┐
│ 1. DETECT NEW RECORDING                                     │
│    VPS cron job → meeting-check.sh                         │
│    ├─ Scans /opt/nextcloud/.../Recordings/Meetings/       │
│    ├─ Finds unprocessed files (not in database)           │
│    └─ Creates meeting record, status = 'pending'           │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 2. EXTRACT AUDIO                                            │
│    ffmpeg → extract audio track to WAV                     │
│    ├─ Input: video.mp4 (Teams/Zoom recording)             │
│    ├─ Output: audio.wav (16kHz mono)                       │
│    └─ Duration: ~30 seconds for 1-hour video               │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 3. TRANSCRIBE                                               │
│    Groq Whisper Large v3 (serverless)                      │
│    ├─ 25 MB WAV chunks (Groq limit)                        │
│    ├─ Outputs: text, VTT, JSON segments                    │
│    ├─ Speed: ~10-15 seconds per hour of audio              │
│    └─ Cost: Free (Groq community credits)                  │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 4. CLEANUP TRANSCRIPT                                       │
│    LLM cleanup (Claude Sonnet 4)                           │
│    ├─ Fix grammar, punctuation, formatting                 │
│    ├─ Remove filler words (um, uh, like)                   │
│    ├─ Merge sentence fragments                              │
│    ├─ Estimate speaker count from context                  │
│    └─ Speaker labels: Speaker 1, Speaker 2, etc.           │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 5. DETECT SPEAKERS (Teams UI)                              │
│    Vision model analyzes video frames                       │
│    ├─ Extract frames every 3 seconds                       │
│    ├─ GPT-4 Vision identifies speaker names from UI       │
│    ├─ Timestamp → speaker name mapping                     │
│    └─ Merge with transcript segments                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 6. EXTRACT INFORMATION                                      │
│    AI extraction (Claude Sonnet 4)                         │
│    ├─ Title and summary                                     │
│    ├─ Attendees list                                        │
│    ├─ Action items (who/what/when)                         │
│    ├─ Decisions made                                        │
│    └─ Topics discussed                                      │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 7. UPDATE CONTEXT                                           │
│    Enrich project/area context files                        │
│    ├─ Add to "Recent Activity" section                     │
│    ├─ Extract business learnings                           │
│    ├─ Track attendee participation                          │
│    └─ Link to related tasks/projects                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 8. CHUNK & EMBED                                            │
│    RAG indexing for semantic search                         │
│    ├─ Hierarchical chunking (speaker turns)                │
│    ├─ OpenAI embeddings (text-embedding-3-small)          │
│    └─ Stored in meeting_chunks table                       │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 9. CREATE TASKS (Telegram)                                 │
│    Send action items for confirmation                       │
│    ├─ Each action item → pending task                      │
│    ├─ User approves via Telegram                           │
│    └─ Approved → creates task in database + Notion         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 10. NOTIFY                                                  │
│     Telegram notification with summary                      │
│     ├─ Meeting title and duration                          │
│     ├─ Key decisions                                        │
│     ├─ Action items count                                   │
│     └─ Link to transcript                                   │
└────────────────────────────────────────────────────────────┘
                          ↓
                   ✅ Meeting Processed
```

**Total Time:** ~2-5 minutes for 1-hour recording

---

## Pipeline Stages

### Stage 1: Detection

**Script:** `/home/ubuntu/automations/meeting-check.sh`
**Frequency:** Every 15 minutes, Mon-Fri 8am-7pm
**Directory:** `/opt/nextcloud/files/oscar/files/Recordings/Meetings/`

**Cron Entry:**

```cron
*/15 8-19 * * 1-5 /home/ubuntu/automations/meeting-check.sh
```

**Detection Script:**

```bash
#!/bin/bash
# meeting-check.sh
# Detects new meeting recordings and processes them

RECORDINGS_DIR="/opt/nextcloud/files/oscar/files/Recordings/Meetings"
LOGFILE="/home/ubuntu/automations/logs/meeting-check.log"

echo "[$(date -Iseconds)] Checking for new recordings..." >> "$LOGFILE"

cd /home/ubuntu/.claude/tools

# Process all pending recordings
/home/ubuntu/.bun/bin/bun run meetings/process-recording.ts --check >> "$LOGFILE" 2>&1

echo "[$(date -Iseconds)] Check complete" >> "$LOGFILE"
```

**Process Check:**

```typescript
// meetings/process-recording.ts --check
async function processPendingRecordings() {
  // 1. Scan recordings directory
  const files = readdirSync(RECORDINGS_DIR);
  const recordings = files.filter(f =>
    /\.(mp4|mkv|mov|avi|webm)$/i.test(f)
  );

  for (const file of recordings) {
    const fullPath = join(RECORDINGS_DIR, file);

    // 2. Check if already in database
    const existing = await sql`
      SELECT id, processing_status FROM meetings
      WHERE recording_path = ${fullPath}
    `;

    if (existing.length === 0) {
      // 3. Create new meeting record
      logger.info(`New recording detected: ${file}`);
      const meetingId = await createMeetingRecord(fullPath);

      // 4. Start processing
      await processRecording(meetingId, fullPath);
    } else if (existing[0].processing_status === 'failed') {
      // Retry failed recordings
      logger.info(`Retrying failed recording: ${file}`);
      await processRecording(existing[0].id, fullPath);
    }
  }
}
```

**File Naming Convention:**

Expected format: `YYYY-MM-DD_HH-mm_title.mp4`

Examples:
- `2026-02-04_10-30_Project_Review.mp4`
- `2026-02-04_14-00_Client_Meeting.mp4`

Date is parsed from filename to determine meeting time.

---

### Stage 2: Audio Extraction

**Tool:** ffmpeg
**Format:** 16kHz mono WAV (Whisper optimized)
**Speed:** ~30 seconds for 1-hour video

**Extraction Command:**

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  const command = [
    'ffmpeg',
    '-i', `"${videoPath}"`,     // Input video
    '-vn',                       // No video
    '-acodec', 'pcm_s16le',     // PCM 16-bit
    '-ar', '16000',             // 16kHz sample rate
    '-ac', '1',                 // Mono
    '-y',                       // Overwrite
    `"${audioPath}"`
  ].join(' ');

  await execAsync(command);
}

// Usage
const videoPath = '/path/to/recording.mp4';
const audioPath = '/tmp/recording_audio.wav';
await extractAudio(videoPath, audioPath);
```

**Why WAV?**
- Whisper requires uncompressed audio
- 16kHz is optimal for speech recognition
- Mono saves bandwidth (meetings usually single audio track)

**File Size:**
- 1 hour video (500 MB) → 30 MB WAV
- Temporary file deleted after transcription

---

### Stage 3: Transcription

**Service:** Groq Cloud (Whisper Large v3)
**Speed:** ~10-15 seconds per hour of audio
**Cost:** Free (community credits)
**Accuracy:** ~95% for clear English speech

**API Call:**

```typescript
import { readFileSync, statSync } from 'fs';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB (Groq limit)

async function transcribeRecording(recordingPath: string) {
  // Extract audio to WAV
  const audioPath = `/tmp/${basename(recordingPath, extname(recordingPath))}.wav`;
  await extractAudio(recordingPath, audioPath);

  // Check file size
  const audioSize = statSync(audioPath).size;

  if (audioSize > MAX_FILE_SIZE) {
    // Split into chunks
    return await transcribeInChunks(audioPath);
  }

  // Single file transcription
  const formData = new FormData();
  formData.append('file', new Blob([readFileSync(audioPath)]));
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'verbose_json'); // Get timestamps
  formData.append('language', 'en');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();

  return {
    text: data.text,
    segments: data.segments, // Array of { start, end, text }
    durationSeconds: data.duration,
    vtt: generateVTT(data.segments), // WebVTT format for video players
  };
}
```

**Chunked Transcription (for large files):**

```typescript
async function transcribeInChunks(audioPath: string) {
  const duration = await getMediaDuration(audioPath);
  const chunkDuration = 10 * 60; // 10 minutes per chunk

  const chunks: any[] = [];

  for (let start = 0; start < duration; start += chunkDuration) {
    const end = Math.min(start + chunkDuration, duration);
    const chunkPath = `/tmp/chunk_${start}.wav`;

    // Extract chunk with ffmpeg
    await execAsync(`ffmpeg -i "${audioPath}" -ss ${start} -t ${end - start} -y "${chunkPath}"`);

    // Transcribe chunk
    const result = await transcribeRecording(chunkPath);

    // Adjust timestamps
    result.segments.forEach(s => {
      s.start += start;
      s.end += start;
    });

    chunks.push(result);
  }

  // Merge results
  return {
    text: chunks.map(c => c.text).join('\n\n'),
    segments: chunks.flatMap(c => c.segments),
    durationSeconds: duration,
    vtt: generateVTT(chunks.flatMap(c => c.segments)),
  };
}
```

**Output Format:**

**Text:**
```
Hello everyone, thank you for joining today's meeting. I wanted to discuss the project timeline and next steps. Sarah, can you give us an update on the deliverables? Sure, we're currently on track to complete the first draft by Friday. We'll need Oscar to review it before we send it to the client.
```

**Segments (JSON):**
```json
[
  {
    "id": 0,
    "start": 0.0,
    "end": 5.2,
    "text": "Hello everyone, thank you for joining today's meeting."
  },
  {
    "id": 1,
    "start": 5.4,
    "end": 10.1,
    "text": "I wanted to discuss the project timeline and next steps."
  },
  {
    "id": 2,
    "start": 10.3,
    "end": 14.7,
    "text": "Sarah, can you give us an update on the deliverables?"
  }
]
```

**VTT (WebVTT):**
```
WEBVTT

00:00:00.000 --> 00:00:05.200
Hello everyone, thank you for joining today's meeting.

00:00:05.400 --> 00:00:10.100
I wanted to discuss the project timeline and next steps.

00:00:10.300 --> 00:00:14.700
Sarah, can you give us an update on the deliverables?
```

---

### Stage 4: Transcript Cleanup

**Model:** Claude Sonnet 4 (via OpenRouter)
**Purpose:** Fix ASR errors, improve readability, estimate speakers

**AI Prompt:**

```typescript
const prompt = `You are a transcript cleanup assistant. Clean and structure this meeting transcript.

RAW TRANSCRIPT (from Whisper ASR):
${rawTranscript}

TASKS:
1. Fix grammar and punctuation
2. Remove filler words (um, uh, like, you know)
3. Merge sentence fragments
4. Add paragraph breaks for speaker changes
5. Estimate number of distinct speakers from context
6. Label speakers as "Speaker 1", "Speaker 2", etc. based on conversation flow

RULES:
- Preserve all content (don't summarize)
- Maintain chronological order
- Use speaker labels even if names unknown
- Add paragraph break when speaker changes

OUTPUT (JSON):
{
  "cleanedText": "Speaker 1: Hello everyone...\n\nSpeaker 2: Thanks for joining...",
  "estimatedSpeakers": ["Speaker 1", "Speaker 2", "Speaker 3"],
  "segments": [
    {
      "speaker": "Speaker 1",
      "text": "Hello everyone, thank you for joining today's meeting.",
      "start": 0.0,
      "end": 5.2
    },
    {
      "speaker": "Speaker 2",
      "text": "Thanks for joining. Let's get started.",
      "start": 5.4,
      "end": 8.1
    }
  ]
}`;
```

**Example Transformation:**

**Before (raw Whisper):**
```
uh hello everyone um thank you for uh joining todays meeting i wanted to uh discuss the the project timeline and uh next steps sarah can you um give us an update on the deliverables sure yeah so were currently um on track to complete the first draft by by friday well need oscar to uh review it before we send it to the client
```

**After (cleaned):**
```
Speaker 1: Hello everyone, thank you for joining today's meeting. I wanted to discuss the project timeline and next steps. Sarah, can you give us an update on the deliverables?

Speaker 2: Sure. We're currently on track to complete the first draft by Friday. We'll need Oscar to review it before we send it to the client.
```

**Benefits:**
- Easier to read
- Clear speaker attribution
- Professional formatting
- Paragraph structure

---

### Stage 5: Speaker Detection (Teams UI)

**Purpose:** Replace "Speaker 1" with actual names from video
**Method:** Vision model analyzes Teams/Zoom UI
**Model:** GPT-4 Vision (via OpenRouter)
**Accuracy:** ~85% for Teams meetings with visible name badges

**Why Vision-Based Detection?**

- Audio-based diarization requires training on speaker voices
- Teams/Zoom UI shows speaker names on-screen
- Vision model can read name badges from video frames
- Works for any meeting platform with visual UI

**Process:**

**1. Extract Frames:**

```typescript
async function extractFrames(videoPath: string, frameInterval: number = 3) {
  const duration = await getMediaDuration(videoPath);
  const frames: string[] = [];

  for (let t = 0; t < duration; t += frameInterval) {
    const framePath = `/tmp/frame_${t}.jpg`;

    await execAsync(
      `ffmpeg -ss ${t} -i "${videoPath}" -frames:v 1 -q:v 2 "${framePath}"`
    );

    frames.push(framePath);
  }

  return frames;
}
```

**2. Analyze Frames with Vision Model:**

```typescript
async function detectSpeakerFromFrame(framePath: string, timestamp: number) {
  const imageData = readFileSync(framePath);
  const base64Image = imageData.toString('base64');

  const prompt = `This is a frame from a Microsoft Teams meeting.

  Identify:
  1. Is this a Teams meeting interface? (look for Teams UI elements)
  2. Who is currently speaking? (look for highlighted name badge or active speaker indicator)
  3. What names are visible in participant list?

  OUTPUT (JSON):
  {
    "isTeamsUI": true,
    "activeSpeaker": "Sarah Johnson",
    "visibleParticipants": ["Sarah Johnson", "Oscar Wright", "Ben Wilding"],
    "confidence": 0.85
  }`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return {
    timestamp,
    speaker: result.activeSpeaker,
    confidence: result.confidence,
    isTeamsUI: result.isTeamsUI,
  };
}
```

**3. Process Video in Batches:**

```typescript
async function parseTeamsRecording(videoPath: string, options = {}) {
  const { frameInterval = 3, maxFrames = 200, batchSize = 5 } = options;

  // Extract frames
  const frames = await extractFrames(videoPath, frameInterval);
  const sampled = frames.slice(0, maxFrames); // Don't process entire 1-hour video

  // Process in batches (rate limit consideration)
  const detections: SpeakerDetection[] = [];

  for (let i = 0; i < sampled.length; i += batchSize) {
    const batch = sampled.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map((frame, idx) => {
        const timestamp = (i + idx) * frameInterval;
        return detectSpeakerFromFrame(frame, timestamp);
      })
    );

    detections.push(...results);
  }

  // Extract speaker list
  const speakers = [...new Set(detections.map(d => d.speaker).filter(Boolean))];

  // Check if Teams UI detected
  const teamsFrames = detections.filter(d => d.isTeamsUI).length;
  const isTeamsUI = teamsFrames > detections.length * 0.5;

  return {
    detections,
    speakers,
    isTeamsUI,
  };
}
```

**4. Merge with Transcript:**

```typescript
function mergeSpakersWithTranscript(
  detections: SpeakerDetection[],
  segments: TranscriptSegment[]
) {
  return segments.map(segment => {
    // Find detection closest to segment timestamp
    const detection = detections.reduce((closest, d) => {
      const diff = Math.abs(d.timestamp - segment.start);
      const closestDiff = Math.abs(closest.timestamp - segment.start);
      return diff < closestDiff ? d : closest;
    });

    // Replace "Speaker 1" with actual name
    return {
      ...segment,
      speaker: detection.speaker || segment.speaker,
    };
  });
}
```

**Result:**

**Before (generic):**
```
Speaker 1: Let's discuss the deliverables.
Speaker 2: We're on track for Friday.
```

**After (named):**
```
Ben Wilding: Let's discuss the deliverables.
Sarah Johnson: We're on track for Friday.
```

**Fallback:**

If Teams UI not detected (e.g., audio-only recording):
- Use generic "Speaker 1", "Speaker 2" labels from cleanup stage
- Still functional for searching/extraction

---

### Stage 6: Information Extraction

**Model:** Claude Sonnet 4 (via OpenRouter)
**Purpose:** Extract structured data from transcript

**Extraction Prompt:**

```typescript
const prompt = `You are a meeting analysis assistant. Extract key information from this meeting transcript.

TRANSCRIPT:
${cleanedTranscript}

KNOWN ATTENDEES (from speaker detection):
${knownAttendees.join(', ')}

EXTRACT:
1. **Title** - What was this meeting about? (5-10 words)
2. **Summary** - One paragraph overview
3. **Attendees** - Full list of people mentioned
4. **Action Items** - Tasks with assignee and deadline
5. **Decisions** - Key decisions made
6. **Topics Discussed** - Main discussion points

OUTPUT (JSON):
{
  "title": "DenovoSkin Q4 Deliverable Review",
  "summary": "Team discussed Q4 deliverable timeline...",
  "attendees": [
    { "name": "Ben Wilding", "role": "Project Lead" },
    { "name": "Sarah Johnson", "role": "Analyst" },
    { "name": "Oscar Wright", "role": "Reviewer" }
  ],
  "actionItems": [
    {
      "task": "Review deliverable draft",
      "assignee": "Oscar Wright",
      "deadline": "Friday",
      "context": "Must review before sending to client"
    },
    {
      "task": "Finalize data analysis section",
      "assignee": "Sarah Johnson",
      "deadline": "Wednesday",
      "context": "Cost-effectiveness tables need updating"
    }
  ],
  "decisions": [
    "Approved quarterly reporting format",
    "Agreed to extend deadline by one week if needed"
  ],
  "topicsDiscussed": [
    "Q4 deliverable timeline",
    "Data analysis methodology",
    "Client feedback from last submission",
    "Resource allocation for next quarter"
  ]
}`;
```

**Stored in Database:**

```sql
UPDATE meetings SET
  title = 'DenovoSkin Q4 Deliverable Review',
  summary = 'Team discussed Q4 deliverable timeline...',
  attendees = '[{"name":"Ben Wilding","role":"Project Lead"}]'::jsonb,
  action_items = '[{"task":"Review deliverable draft","assignee":"Oscar Wright"}]'::jsonb,
  decisions = '["Approved quarterly reporting format"]'::jsonb,
  topics_discussed = '["Q4 deliverable timeline"]'::jsonb,
  processing_status = 'extracted'
WHERE id = ${meetingId}
```

---

### Stage 7: Context Updates

**Purpose:** Enrich project context files with meeting insights
**Script:** `meetings/lib/context-update.ts`

**Updates Made:**

**1. Project Recent Activity:**

Location: `context/projects/CTS010 denovoSkin.md`

```markdown
## Recent Activity

### Feb 4, 2026 - Team Meeting
**Meeting:** DenovoSkin Q4 Deliverable Review (45 min)
**Attendees:** Ben Wilding, Sarah Johnson, Oscar Wright

**Key Discussion:**
- Q4 deliverable timeline on track for Friday deadline
- Data analysis methodology approved by client
- Resource allocation for next quarter discussed

**Decisions:**
- Approved quarterly reporting format
- Agreed to extend deadline by one week if needed

**Action Items:**
- Oscar: Review deliverable draft by Friday
- Sarah: Finalize data analysis section by Wednesday
```

**2. Business Learnings:**

```markdown
### Learnings

- **Feb 4:** Client prefers quarterly reports over monthly (from meeting discussion)
- **Feb 4:** New data format required for cost-effectiveness tables (from Sarah's comment)
```

**3. Attendee Tracking:**

```markdown
## Team Members

**Ben Wilding** (Project Lead)
- Last meeting: Feb 4, 2026
- Topics: deliverables, timelines, client feedback
- Meetings attended: 12

**Sarah Johnson** (Analyst)
- Last meeting: Feb 4, 2026
- Topics: data analysis, cost-effectiveness, methodologies
- Meetings attended: 8
```

**Implementation:**

```typescript
async function updateContextFromMeeting(meetingId: string) {
  const meeting = await sql`
    SELECT * FROM meetings WHERE id = ${meetingId}::uuid
  `;

  // Determine project from meeting content
  const projectCode = extractProjectCode(meeting.title, meeting.summary);

  if (!projectCode) {
    logger.warn('Could not determine project for meeting');
    return;
  }

  // Add to Recent Activity
  await addRecentActivity(projectCode, {
    type: 'meeting',
    date: meeting.recorded_at,
    title: meeting.title,
    summary: meeting.summary,
    attendees: meeting.attendees,
    decisions: meeting.decisions,
    actionItems: meeting.action_items,
  });

  // Extract and save business learnings
  for (const decision of meeting.decisions || []) {
    await addBusinessLearning(projectCode, {
      source: 'meeting',
      content: decision,
      date: meeting.recorded_at,
    });
  }

  // Track attendee participation
  for (const attendee of meeting.attendees || []) {
    await trackAttendee(projectCode, {
      name: attendee.name,
      role: attendee.role,
      lastSeen: meeting.recorded_at,
      topics: meeting.topics_discussed,
    });
  }
}
```

---

### Stage 8: RAG Indexing

**Purpose:** Make transcript searchable via semantic search
**Model:** OpenAI text-embedding-3-small
**Storage:** `meeting_chunks` table with pgvector embeddings

**Chunking Strategy:**

Unlike document chunking (hierarchical by headings), meeting transcripts chunk by speaker turns:

```typescript
function chunkMeetingTranscript(segments: TranscriptSegment[]) {
  const chunks: MeetingChunk[] = [];
  let currentChunk: string[] = [];
  let currentSpeaker: string | null = null;
  let chunkStart: number = 0;

  for (const segment of segments) {
    // Start new chunk on speaker change OR max 1000 tokens
    if (segment.speaker !== currentSpeaker || currentChunk.length > 20) {
      if (currentChunk.length > 0) {
        chunks.push({
          speaker: currentSpeaker,
          content: currentChunk.join(' '),
          start: chunkStart,
          end: segment.start,
          tokenCount: estimateTokens(currentChunk.join(' ')),
        });
      }

      currentChunk = [];
      currentSpeaker = segment.speaker;
      chunkStart = segment.start;
    }

    currentChunk.push(segment.text);
  }

  return chunks;
}
```

**Generate Embeddings:**

```typescript
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk.content);

  await sql`
    INSERT INTO meeting_chunks (
      meeting_id,
      content,
      speaker,
      sequence_number,
      token_count,
      embedding
    ) VALUES (
      ${meetingId}::uuid,
      ${chunk.content},
      ${chunk.speaker},
      ${chunks.indexOf(chunk)},
      ${chunk.tokenCount},
      ${sql.vector(embedding)}
    )
  `;
}
```

**Searchable via RAG:**

```typescript
// Example: "What did Sarah say about the budget?"
const results = await searchMeetings("budget discussion Sarah", {
  limit: 10,
  minSimilarity: 0.7,
});

// Returns:
// [
//   {
//     meeting_title: "DenovoSkin Q4 Review",
//     speaker: "Sarah Johnson",
//     content: "The budget for Q4 is on track...",
//     timestamp: "00:15:30",
//     similarity: 0.89
//   }
// ]
```

---

### Stage 9: Task Creation

**Purpose:** Convert action items to pending tasks via Telegram
**Trigger:** After extraction stage
**Confirmation:** User approves each task individually

**Process:**

```typescript
async function createPendingMeetingTasks(meetingId: string) {
  const meeting = await sql`
    SELECT * FROM meetings WHERE id = ${meetingId}::uuid
  `;

  for (const item of meeting.action_items || []) {
    // Create pending confirmation
    await sql`
      INSERT INTO pending_task_confirmations (
        source,
        source_id,
        proposed_title,
        proposed_notes,
        proposed_due_date,
        proposed_assignee
      ) VALUES (
        'meeting',
        ${meetingId},
        ${item.task},
        ${`From meeting: ${meeting.title}\nContext: ${item.context}`},
        ${parseDateString(item.deadline)},
        ${item.assignee}
      )
    `;
  }

  // Send Telegram notification
  await sendMeetingTasksNotification(meetingId);
}
```

**Telegram Message:**

```
📹 Meeting processed: DenovoSkin Q4 Review

3 action items extracted:

1. Review deliverable draft
   Assignee: Oscar Wright
   Deadline: Friday
   Context: Must review before sending to client

2. Finalize data analysis section
   Assignee: Sarah Johnson
   Deadline: Wednesday
   Context: Cost-effectiveness tables need updating

3. Schedule follow-up meeting
   Assignee: Ben Wilding
   Deadline: Next week

Reply with numbers to create tasks:
• "1 3" to create items 1 and 3
• "all" to create all
• "skip" to dismiss
```

**User Interaction:**

```
User: 1 2

Kay: ✅ Created 2 tasks:
• Review deliverable draft (due Friday)
• Finalize data analysis section (due Wednesday)
```

Tasks created in database with `source = 'meeting'` and link to meeting record.

---

### Stage 10: Notifications

**Telegram Summary:**

```
📹 Meeting processed successfully

**Title:** DenovoSkin Q4 Deliverable Review
**Duration:** 45 minutes
**Attendees:** Ben Wilding, Sarah Johnson, Oscar Wright

**Summary:**
Team discussed Q4 deliverable timeline, which is on track for Friday deadline. Data analysis methodology was approved by client. Resource allocation for next quarter was also covered.

**Key Decisions:**
• Approved quarterly reporting format
• Agreed to extend deadline by one week if needed

**Action Items:** 3 extracted (review above for confirmation)

**Topics:**
• Q4 deliverable timeline
• Data analysis methodology
• Client feedback
• Resource allocation

📄 Transcript available in Nextcloud
```

---

## Configuration

### Environment Variables

```bash
# Audio Processing
FFMPEG_PATH=/usr/bin/ffmpeg

# Transcription
GROQ_API_KEY=gsk_xxxxx
WHISPER_MODEL=whisper-large-v3

# AI Processing
OPENROUTER_API_KEY=sk-or-xxxxx
MEETING_CLEANUP_MODEL=anthropic/claude-sonnet-4
MEETING_EXTRACTION_MODEL=anthropic/claude-sonnet-4
MEETING_VISION_MODEL=openai/gpt-4-vision-preview

# Embeddings
OPENAI_API_KEY=sk-xxxxx
EMBEDDING_MODEL=text-embedding-3-small

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_ADMIN_CHAT_ID=123456789

# Paths
RECORDINGS_DIR=/opt/nextcloud/files/oscar/files/Recordings/Meetings
TEMP_DIR=/tmp
```

### Cron Schedule

```cron
# Check for new recordings every 15 minutes during business hours
*/15 8-19 * * 1-5 /home/ubuntu/automations/meeting-check.sh
```

**Why these hours?**
- Meetings typically happen 8am-7pm
- Check every 15 min balances responsiveness vs resource usage
- Processing takes 2-5 min, so 15-min interval prevents overlap

### Processing Thresholds

```typescript
// meetings/lib/config.ts

export const MEETING_CONFIG = {
  // Frame extraction
  frameInterval: 3,              // Extract frame every 3 seconds
  maxFrames: 200,                // Max 200 frames per video (10 min sampling)
  visionBatchSize: 5,            // Process 5 frames at a time

  // Transcription
  maxAudioChunkSize: 25 * 1024 * 1024,  // 25 MB (Groq limit)
  chunkOverlap: 1,               // 1 second overlap between chunks

  // Chunking
  maxChunkTokens: 1000,          // Max tokens per chunk
  speakerTurnThreshold: 20,      // New chunk after 20 segments (same speaker)

  // Task extraction
  minActionItemConfidence: 0.7,  // Below this, don't create task
  autoApproveThreshold: 0.95,    // Above this, auto-create task (skip confirmation)
};
```

---

## Troubleshooting

### Recording Not Detected

**Symptoms:**
- File in Recordings/Meetings folder but not processed
- No database entry or Telegram notification

**Diagnosis:**

1. **Check cron is running:**
   ```bash
   crontab -l | grep meeting-check
   ```

2. **Check logs:**
   ```bash
   tail -f /home/ubuntu/automations/logs/meeting-check.log
   ```

3. **Check file format:**
   ```bash
   file /opt/nextcloud/.../Recordings/Meetings/recording.mp4
   ```

4. **Check database:**
   ```sql
   SELECT * FROM meetings
   WHERE recording_path LIKE '%recording.mp4%';
   ```

**Common Causes:**

1. **Wrong directory:** File in Recordings/ instead of Recordings/Meetings/
   - **Fix:** Move to correct folder

2. **Unsupported format:** File is .wmv or other unsupported format
   - **Fix:** Convert to .mp4 with ffmpeg

3. **Cron not running:** Cron daemon stopped
   - **Fix:** `sudo systemctl start cron`

4. **File permissions:** Recording not readable by ubuntu user
   - **Fix:** `chmod 644 /path/to/recording.mp4`

---

### Transcription Failed

**Symptoms:**
- Meeting status stuck on 'transcribing'
- No transcript in database

**Diagnosis:**

1. **Check processing status:**
   ```sql
   SELECT
     recording_path,
     processing_status,
     processing_error,
     updated_at
   FROM meetings
   WHERE processing_status = 'failed';
   ```

2. **Test Groq API:**
   ```bash
   curl -X POST https://api.groq.com/openai/v1/audio/transcriptions \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -F "file=@test.wav" \
     -F "model=whisper-large-v3"
   ```

3. **Check audio extraction:**
   ```bash
   cd /home/ubuntu/.claude/tools
   bun run meetings/lib/transcribe.ts test /path/to/recording.mp4
   ```

**Common Causes:**

1. **Audio extraction failed:** ffmpeg error (codec not supported)
   - **Check:** `ffmpeg -i recording.mp4` (should show audio stream)
   - **Fix:** Re-encode video: `ffmpeg -i input.mp4 -c:v copy -c:a aac output.mp4`

2. **Groq API error:** Rate limit or service down
   - **Check:** Groq status page
   - **Fix:** Wait and retry, or use alternative API

3. **File too large:** Audio > 25 MB but chunking failed
   - **Fix:** Manually split video into smaller segments

---

### Speaker Detection Not Working

**Symptoms:**
- Transcript shows "Speaker 1", "Speaker 2" instead of names
- Teams UI detection confidence low

**Diagnosis:**

1. **Check if Teams UI:**
   ```bash
   # Extract a sample frame
   ffmpeg -ss 60 -i recording.mp4 -frames:v 1 -q:v 2 sample_frame.jpg

   # Open image, verify Teams UI visible
   ```

2. **Check vision model results:**
   ```sql
   SELECT
     title,
     attendees,
     transcript_text
   FROM meetings
   WHERE id = 'meeting-id';
   ```

3. **Test vision API:**
   ```bash
   cd /home/ubuntu/.claude/tools
   bun run meetings/lib/teams-parser.ts test recording.mp4
   ```

**Common Causes:**

1. **Not a Teams/Zoom recording:** Audio-only or screen share
   - **Expected:** Generic speaker labels are fine
   - **No fix needed:** System still works without names

2. **Name badges not visible:** Participants turned off video
   - **Fix:** Can't detect speakers from audio alone
   - **Workaround:** Manually edit transcript in database

3. **Vision model failed:** GPT-4 Vision API error
   - **Check:** OpenRouter logs
   - **Fix:** Retry processing after API recovers

---

### No Action Items Extracted

**Symptoms:**
- Meeting clearly had action items but none extracted
- Empty `action_items` in database

**Diagnosis:**

1. **Check extraction:**
   ```sql
   SELECT
     title,
     summary,
     action_items,
     transcript_text
   FROM meetings
   WHERE id = 'meeting-id';
   ```

2. **Review transcript:**
   ```sql
   SELECT transcript_text FROM meetings WHERE id = 'meeting-id';
   ```
   Look for phrases like "Oscar will...", "need to...", "by Friday"

3. **Test extraction manually:**
   ```bash
   cd /home/ubuntu/.claude/tools
   bun run meetings/lib/extract.ts test 'meeting-id'
   ```

**Common Causes:**

1. **Implicit action items:** Not explicitly stated ("we should..." vs "Oscar will...")
   - **Fix:** AI conservative to avoid false positives
   - **Workaround:** Manually create tasks

2. **Poor transcript quality:** Mumbled audio or background noise
   - **Check:** Read transcript, verify accuracy
   - **Fix:** Improve recording quality (better mic)

3. **Extraction model failed:** Claude API error
   - **Check:** OpenRouter logs
   - **Fix:** Retry processing

---

### Context Not Updated

**Symptoms:**
- Meeting processed successfully
- But project context file not updated with activity

**Diagnosis:**

1. **Check project code detection:**
   ```sql
   SELECT
     title,
     summary,
     topics_discussed
   FROM meetings
   WHERE id = 'meeting-id';
   ```
   Look for project codes (CTS010, SOBI036, etc.)

2. **Check context file:**
   ```bash
   cat /home/ubuntu/.claude/context/projects/CTS010\ denovoSkin.md
   ```
   Look for Recent Activity section

3. **Check work projects database:**
   ```sql
   SELECT project_code, project_name
   FROM work_projects
   WHERE status = 'active';
   ```

**Common Causes:**

1. **Project code not mentioned:** Meeting about project but code never said
   - **Fix:** Manually link meeting to project in database

2. **Project not in database:** New project not added yet
   - **Fix:** Add to `work_projects` table

3. **Context update script failed:** Error writing to file
   - **Check:** File permissions on context directory
   - **Fix:** `chmod -R u+w /home/ubuntu/.claude/context`

---

## Performance Metrics

**Current State (February 2026):**

- Meetings processed: ~15-20 per month
- Average duration: 45-60 minutes
- Processing success rate: ~92%

**Processing Times:**

| Stage | Duration | Notes |
|-------|----------|-------|
| Audio extraction | 30-60s | Depends on video size |
| Transcription | 10-15s/hour | Groq Whisper v3 |
| Cleanup | 20-30s | Claude Sonnet 4 |
| Speaker detection | 2-5 min | Vision model on 200 frames |
| Extraction | 30-45s | Claude Sonnet 4 |
| Context updates | 5-10s | File writes |
| RAG indexing | 30-60s | Embeddings generation |
| **Total** | **4-8 min** | For 1-hour meeting |

**Costs (per 1-hour meeting):**

- Transcription: $0 (Groq free tier)
- Cleanup: ~$0.15 (Claude Sonnet 4, ~50K tokens)
- Speaker detection: ~$0.80 (GPT-4 Vision, 200 images)
- Extraction: ~$0.10 (Claude Sonnet 4, ~30K tokens)
- Embeddings: ~$0.02 (OpenAI embeddings, ~10K tokens)
- **Total: ~$1.07 per meeting**

**Monthly cost estimate:** 20 meetings × $1.07 = ~$21.40

---

## Related Documentation

- [RAG Search](./rag-search.md) - Searching meeting transcripts
- [Telegram Bot](./telegram-bot.md) - Task confirmation interface
- [File Processing](./file-processing.md) - Similar pipeline for documents
- [Notion Sync](./notion-sync.md) - How extracted tasks sync to Notion
- [Database Schema](../04-development/database-schema.md) - Meetings tables
