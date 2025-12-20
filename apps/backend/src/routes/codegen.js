/**
 * RARE 4N - Code Generation Routes
 * ???????????? ?????????? ??????????
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();
const OPENAI_KEY=REPLACE_ME

/**
 * POST /api/codegen
 * Generate code based on prompt
 */
router.post('/', async (req, res) => {
  try {
    const { prompt, extension, language } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!OPENAI_KEY=REPLACE_ME
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Build system prompt based on language
    const systemPrompt = `You are an expert ${language || 'programmer'}. 
Generate clean, production-ready code in ${language || 'TypeScript'}.
Follow best practices and include comments where necessary.
Return ONLY the code, no explanations unless requested.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedCode = response.data.choices[0].message.content;

    res.json({
      success: true,
      code: generatedCode,
      language: language || 'TypeScript',
      extension: extension || 'ts',
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to generate code' 
    });
  }
});

/**
 * POST /api/codegen/image
 * Generate image using DALL-E
 */
router.post('/image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'standard', n = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!OPENAI_KEY=REPLACE_ME
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt,
        size,
        quality,
        n: Math.min(n, 1), // DALL-E 3 only supports n=1
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      images: response.data.data.map(img => ({
        url: img.url,
        revised_prompt: img.revised_prompt,
      })),
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to generate image' 
    });
  }
});

/**
 * POST /api/codegen/video
 * Generate video using RunwayML, Pika, or OpenAI Sora (when available)
 */
router.post('/video', async (req, res) => {
  try {
    const { prompt, duration = 5, style, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
    const PIKA_API_KEY = process.env.PIKA_API_KEY;
    const OPENAI_KEY=REPLACE_ME

    // Try RunwayML first (if API key available)
    if (RUNWAY_API_KEY) {
      try {
        const runwayResponse = await axios.post(
          'https://api.runwayml.com/v1/image-to-video',
          {
            image: null, // Would need image for image-to-video
            prompt,
            duration,
            aspectRatio,
          },
          {
            headers: {
              'Authorization': `Bearer ${RUNWAY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return res.json({
          success: true,
          video: {
            url: runwayResponse.data.video_url,
            duration,
            provider: 'runway',
          },
        });
      } catch (runwayError) {
        console.warn('RunwayML failed, trying alternatives:', runwayError.message);
      }
    }

    // Try Pika (if API key available)
    if (PIKA_API_KEY) {
      try {
        const pikaResponse = await axios.post(
          'https://api.pika.art/v1/generate',
          {
            prompt,
            duration,
            aspectRatio,
          },
          {
            headers: {
              'Authorization': `Bearer ${PIKA_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return res.json({
          success: true,
          video: {
            url: pikaResponse.data.video_url,
            duration,
            provider: 'pika',
          },
        });
      } catch (pikaError) {
        console.warn('Pika failed, using fallback:', pikaError.message);
      }
    }

    // Fallback: Generate video description and return structured response
    // In production, this would queue the video generation or use OpenAI Sora when available
    if (OPENAI_KEY=REPLACE_ME
      try {
        const descriptionResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a video production expert. Describe a video scene in detail.',
              },
              {
                role: 'user',
                content: `Describe a ${duration}-second video: ${prompt}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
              'Content-Type': 'application/json',
            },
          }
        );

        const videoDescription = descriptionResponse.data.choices[0].message.content;

        return res.json({
          success: true,
          video: {
            description: videoDescription,
            prompt,
            duration,
            provider: 'openai-description',
            message: 'Video description generated. Video generation requires RunwayML or Pika API key.',
          },
          instructions: {
            setup: 'To enable video generation, add RUNWAY_API_KEY or PIKA_API_KEY to your .env file',
            providers: {
              runway: 'https://runwayml.com',
              pika: 'https://pika.art',
            },
          },
        });
      } catch (error) {
        console.error('OpenAI description generation error:', error);
      }
    }

    // Final fallback
    res.json({
      success: true,
      video: {
        prompt,
        duration,
        provider: 'placeholder',
      },
      message: 'Video generation requires API key. Add RUNWAY_API_KEY or PIKA_API_KEY to enable.',
      instructions: {
        setup: 'Add RUNWAY_API_KEY or PIKA_API_KEY to backend/.env',
        providers: {
          runway: 'https://runwayml.com',
          pika: 'https://pika.art',
        },
      },
    });
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || 'Failed to generate video' 
    });
  }
});

/**
 * POST /api/codegen/presentation
 * Generate PowerPoint presentation
 */
router.post('/presentation', async (req, res) => {
  try {
    const { topic, slides, format = 'pptx' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!OPENAI_KEY=REPLACE_ME
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Generate presentation content
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a presentation expert. Create a ${slides || 10}-slide presentation about: ${topic}.
Return the content in JSON format with this structure:
{
  "title": "Presentation Title",
  "slides": [
    {"number": 1, "title": "Slide Title", "content": "Slide content", "notes": "Speaker notes"}
  ]
}`,
          },
          {
            role: 'user',
            content: `Create a presentation about: ${topic}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
          'Content-Type': 'application/json',
        },
      }
    );

    const presentationData = JSON.parse(response.data.choices[0].message.content);

    // In production, use a library like 'pptxgenjs' to create actual PPTX file
    res.json({
      success: true,
      presentation: presentationData,
      format,
      message: 'Presentation content generated. In production, this would create an actual PPTX file.',
    });
  } catch (error) {
    console.error('Presentation generation error:', error);
    res.status(500).json({ error: 'Failed to generate presentation' });
  }
});

/**
 * POST /api/codegen/html
 * Generate HTML page
 */
router.post('/html', async (req, res) => {
  try {
    const { prompt, includeCSS = true, includeJS = false } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!OPENAI_KEY=REPLACE_ME
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const systemPrompt = `You are an expert web developer. Generate complete, production-ready HTML.
${includeCSS ? 'Include inline CSS or <style> tag.' : ''}
${includeJS ? 'Include JavaScript in <script> tag.' : ''}
Return ONLY the HTML code, no markdown formatting.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
          'Content-Type': 'application/json',
        },
      }
    );

    const htmlCode = response.data.choices[0].message.content;

    res.json({
      success: true,
      html: htmlCode,
      includeCSS,
      includeJS,
    });
  } catch (error) {
    console.error('HTML generation error:', error);
    res.status(500).json({ error: 'Failed to generate HTML' });
  }
});

export default router;


