import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { Mp3Encoder } from '@breezystack/lamejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Converts a 16-bit PCM WAV Buffer into an MP3 Buffer
 */
export function convertWavToMp3(
  wavBuffer: Buffer,
  bitrateKbps = 192
): { mp3Buffer: Buffer; duration: number; sampleRate: number; channels: number } {
  let fmtOffset = -1;
  let dataOffset = -1;
  let dataSize = 0;

  for (let i = 12; i < wavBuffer.length - 8; i++) {
    const chunkId = wavBuffer.toString('ascii', i, i + 4);
    if (chunkId === 'fmt ') {
      fmtOffset = i;
    } else if (chunkId === 'data') {
      dataOffset = i + 8;
      dataSize = wavBuffer.readUInt32LE(i + 4);
      break;
    }
  }

  const channels = fmtOffset !== -1 ? wavBuffer.readUInt16LE(fmtOffset + 10) : 1;
  const sampleRate = fmtOffset !== -1 ? wavBuffer.readUInt32LE(fmtOffset + 12) : 24000;
  const bitsPerSample = fmtOffset !== -1 ? wavBuffer.readUInt16LE(fmtOffset + 22) : 16;

  if (dataOffset === -1) {
    dataOffset = 44;
  }
  if (!dataSize || dataOffset + dataSize > wavBuffer.length) {
    dataSize = wavBuffer.length - dataOffset;
  }

  const rawPcm = wavBuffer.subarray(dataOffset, dataOffset + dataSize);
  const sampleCount = Math.floor(rawPcm.length / (bitsPerSample / 8));
  const samples = new Int16Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    samples[i] = rawPcm.readInt16LE(i * 2);
  }

  const duration = sampleCount / (sampleRate * (channels || 1));

  // Encode with Mp3Encoder
  const encoder = new Mp3Encoder(channels, sampleRate, bitrateKbps);
  const mp3Chunks: Uint8Array[] = [];
  const chunkSize = 1152;

  if (channels === 1) {
    for (let i = 0; i < samples.length; i += chunkSize) {
      const slice = samples.subarray(i, i + chunkSize);
      const encoded = encoder.encodeBuffer(slice);
      if (encoded.length > 0) {
        mp3Chunks.push(encoded);
      }
    }
  } else {
    const half = Math.floor(sampleCount / 2);
    const left = new Int16Array(half);
    const right = new Int16Array(half);
    for (let i = 0; i < half; i++) {
      left[i] = samples[i * 2];
      right[i] = samples[i * 2 + 1];
    }
    for (let i = 0; i < left.length; i += chunkSize) {
      const leftSlice = left.subarray(i, i + chunkSize);
      const rightSlice = right.subarray(i, i + chunkSize);
      const encoded = encoder.encodeBuffer(leftSlice, rightSlice);
      if (encoded.length > 0) {
        mp3Chunks.push(encoded);
      }
    }
  }

  const flush = encoder.flush();
  if (flush.length > 0) {
    mp3Chunks.push(flush);
  }

  const totalLength = mp3Chunks.reduce((acc, c) => acc + c.length, 0);
  const mp3Buffer = Buffer.alloc(totalLength);
  let pos = 0;
  for (const c of mp3Chunks) {
    mp3Buffer.set(c, pos);
    pos += c.length;
  }

  return {
    mp3Buffer,
    duration,
    sampleRate,
    channels,
  };
}

// Preset voices metadata
const PRESET_VOICES = [
  {
    id: 'Kore',
    name: 'Kore (โครี่)',
    gender: 'female',
    tone: 'อบอุ่น เป็นมิตร ละมุน ชัดเจน',
    category: 'หญิง',
    recommendFor: 'เล่าเรื่อง, พอดแคสต์, อ่านบทความทั่วไป',
    badge: 'ยอดนิยม',
  },
  {
    id: 'Puck',
    name: 'Puck (พัคก์)',
    gender: 'male',
    tone: 'สดใส มีพลัง วัยรุ่น กระตือรือร้น',
    category: 'ชาย',
    recommendFor: 'รีวิวสินค้า, วิดีโอสั้น TikTok/Reels, ข่าวบันเทิง',
    badge: 'พลังบวก',
  },
  {
    id: 'Charon',
    name: 'Charon (คารอน)',
    gender: 'male',
    tone: 'ทุ้มลึก สุขุม น่าเชื่อถือ มีอำนาจ',
    category: 'ชาย',
    recommendFor: 'อ่านข่าวทางการ, สารคดี, บทความธุรกิจ',
    badge: 'ทางการ',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (เฟนริล)',
    gender: 'male',
    tone: 'เข้มข้น ดุดัน ทรงพลัง ชวนตื่นเต้น',
    category: 'ชาย',
    recommendFor: 'พากย์ภาพยนตร์, โฆษณา, เรื่องลึกลับระทึกขวัญ',
    badge: 'พากย์หนัง',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (เซเฟอร์)',
    gender: 'female',
    tone: 'อ่อนโยน สงบ ผ่อนคลาย สบายหู',
    category: 'หญิง',
    recommendFor: 'นิทานก่อนนอน, นั่งสมาธิ, ผ่อนคลาย ASMR',
    badge: 'ผ่อนคลาย',
  },
  {
    id: 'Aoede',
    name: 'Aoede (ออยดี)',
    gender: 'female',
    tone: 'ไพเราะ มีจังหวะจะโคน สดใส ชัดถ้อยชัดคำ',
    category: 'หญิง',
    recommendFor: 'การศึกษา, บรรยายคอร์สเรียน, เสียงแนะนำ IVR',
    badge: 'การศึกษา',
  },
];

const PRESET_STYLES = [
  {
    id: 'news',
    name: 'ผู้ประกาศข่าวทางการ',
    prompt: 'Clear, authoritative, and professional broadcast news anchor with precise articulation',
    icon: 'Radio',
    desc: 'น้ำเสียงทางการ ชัดถ้อยชัดคำ เว้นวรรคเป็นระบบ เหมาะกับข่าวสารและสารคดี',
  },
  {
    id: 'story',
    name: 'นักเล่านิทานอบอุ่น',
    prompt: 'Warm, expressive, imaginative bedtime storyteller speaking softly with wonder and emotion',
    icon: 'BookOpen',
    desc: 'นุ่มนวล ชวนฝัน อบอุ่น มีอารมณ์ร่วม เหมาะกับนิทานและเรื่องเล่า',
  },
  {
    id: 'marketing',
    name: 'นักพากย์โฆษณา / รีวิว',
    prompt: 'Upbeat, high energy, persuasive and vibrant commercial influencer pitching an exciting product',
    icon: 'Sparkles',
    desc: 'สดใส กระตือรือร้น เชิญชวน ชวนติดตาม เหมาะกับขายของและโปรโมต',
  },
  {
    id: 'podcast',
    name: 'พิธีกรพอดแคสต์เป็นกันเอง',
    prompt: 'Friendly, engaging, conversational podcast host speaking naturally as if talking to a close friend',
    icon: 'Mic',
    desc: 'พูดคุยธรรมชาติ เป็นมิตร สบายๆ เหมือนคุยกับเพื่อนสนิท',
  },
  {
    id: 'meditation',
    name: 'ผู้นำฝึกสมาธิ ผ่อนคลาย',
    prompt: 'Serene, gentle, deeply relaxing mindfulness meditation guide speaking slowly with peaceful breathing pauses',
    icon: 'Heart',
    desc: 'ผ่อนคลาย แผ่วเบา สบายใจ ช่วยคลายความเครียดและหลับสบาย',
  },
  {
    id: 'drama',
    name: 'ดราม่าเข้มข้น เร้าใจ',
    prompt: 'Intense, cinematic movie trailer narrator with emotional depth, suspense, and dramatic pacing',
    icon: 'Film',
    desc: 'ตื่นเต้น ระทึก มีน้ำหนัก ดึงดูดอารมณ์ผู้ฟัง',
  },
  {
    id: 'teacher',
    name: 'ครูผู้สอน ชัดเจนเข้าใจง่าย',
    prompt: 'Encouraging, patient, articulate educator explaining concepts clearly and warmly to students',
    icon: 'GraduationCap',
    desc: 'เน้นความเข้าใจ ชัดเจน เว้นจังหวะคิด เหมาะกับบทเรียนและพรีเซนต์',
  },
];

// GET: Voices & Styles metadata
app.get('/api/voices', (_req: Request, res: Response) => {
  res.json({
    voices: PRESET_VOICES,
    styles: PRESET_STYLES,
    models: [
      {
        id: 'gemini-3.8-flash-lite-tts',
        name: 'Gemini 3.8 Flash-Lite TTS (แนะนำ - รวดเร็ว คุณภาพสูง)',
        description: 'เหมาะสำหรับอ่านบทความ ข่าว พอดแคสต์ และงานเสียงทั่วไป ความเร็วสูง',
      },
      {
        id: 'gemini-3.8-flash-tts',
        name: 'Gemini 3.8 Flash TTS (พรีเมียม - ดราม่า & อารมณ์ลึกซึ้ง)',
        description: 'รุ่นเรือธงสำหรับงานพากย์บทละคร ละเอียดอ่อน รองรับอารมณ์และเสียงหายใจ',
      },
    ],
  });
});

// POST: Generate Speech with Gemini and convert to MP3
app.post('/api/tts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice = 'Kore', stylePrompt = '', model = 'gemini-3.8-flash-lite-tts' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'กรุณากรอกข้อความที่ต้องการแปลงเป็นเสียง' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'ยังไม่ได้กำหนด GEMINI_API_KEY กรุณาตรวจสอบการตั้งค่า API Key ในระบบ',
      });
      return;
    }

    const trimmedText = text.trim();
    // Validate model selection according to Gemini guidelines
    const targetModel =
      model === 'gemini-3.8-flash-tts' ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';

    // Prepare contents
    const speechPart: any = {
      text: trimmedText,
    };

    if (stylePrompt && stylePrompt.trim()) {
      speechPart.speechMetadata = {
        style: stylePrompt.trim(),
      };
    }

    // Call Gemini API server-side
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [
        {
          role: 'user',
          parts: [speechPart],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({
        error: 'ไม่สามารถสร้างไฟล์เสียงได้จากข้อความที่ระบุ กรุณาลองใหม่อีกครั้ง',
      });
      return;
    }

    // Decode WAV from base64
    const wavBuffer = Buffer.from(base64Audio, 'base64');

    // Convert WAV into MP3 using pure Node encoder
    const { mp3Buffer, duration, sampleRate } = convertWavToMp3(wavBuffer, 192);

    const mp3Base64 = mp3Buffer.toString('base64');
    const wavBase64 = wavBuffer.toString('base64');

    res.json({
      success: true,
      text: trimmedText,
      voice,
      style: stylePrompt,
      model: targetModel,
      duration: Math.round(duration * 10) / 10,
      sampleRate,
      mp3Base64,
      wavBase64,
      mp3Size: mp3Buffer.length,
      wavSize: wavBuffer.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    const errorMsg = error?.message || 'เกิดข้อผิดพลาดในการสร้างเสียงพูด';
    res.status(500).json({
      error: `การแปลงเสียงขัดข้อง: ${errorMsg}`,
    });
  }
});

// POST: Convert arbitrary WAV base64 to MP3
app.post('/api/tts/wav-to-mp3', async (req: Request, res: Response): Promise<void> => {
  try {
    const { wavBase64, bitrate = 192 } = req.body;
    if (!wavBase64) {
      res.status(400).json({ error: 'WAV base64 data is required' });
      return;
    }

    const wavBuffer = Buffer.from(wavBase64, 'base64');
    const { mp3Buffer, duration, sampleRate } = convertWavToMp3(wavBuffer, bitrate);

    res.json({
      success: true,
      mp3Base64: mp3Buffer.toString('base64'),
      duration,
      sampleRate,
      size: mp3Buffer.length,
    });
  } catch (err: any) {
    console.error('Error converting WAV to MP3:', err);
    res.status(500).json({ error: err.message || 'Error converting WAV to MP3' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (http://0.0.0.0:${port})`);
  });
}

startServer();
