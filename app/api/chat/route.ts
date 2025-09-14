import { NextRequest, NextResponse } from 'next/server';

async function tryOpenAI(message: string, systemPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return null;
    }

    return {
      response: data.choices[0].message.content,
      provider: 'openai',
      usage: data.usage
    };

  } catch (error) {
    return null;
  }
}

async function tryOpenRouter(message: string, systemPrompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'MyDevFolioXD Portfolio Assistant'
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return null;
    }

    return {
      response: data.choices[0].message.content,
      provider: 'openrouter',
      usage: data.usage
    };

  } catch (error) {
    return null;
  }
}

async function tryGemini(message: string, systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      return null;
    }

    return {
      response: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      usage: data.usageMetadata
    };

  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Portfolio-specific context and instructions
    const systemPrompt = `You are a helpful Portfolio Assistant for MyDevFolioXD, a stunning developer portfolio platform. You help users understand and make the most of their portfolios.

Key features of MyDevFolioXD:
- Beautiful developer portfolios from GitHub usernames
- 25+ amazing components including analytics, live coding, themes, etc.
- Responsive design that works on all devices
- Interactive resume builder with drag-and-drop
- Theme customization with 6 beautiful color schemes
- Project showcase with filtering and search
- Achievement badges and gamification
- Live coding animations
- PDF export functionality
- Blog section for content
- Visitor analytics and tracking

Guidelines:
- Be friendly, helpful, and enthusiastic
- Keep responses concise but informative
- Use emojis appropriately to make responses engaging
- Focus on helping users understand and use portfolio features
- If asked about technical details, provide clear explanations
- Always mention specific features when relevant
- Encourage users to explore different sections

${context ? `Additional context: ${context}` : ''}`;

    // Try OpenAI first (ChatGPT)
    let result = await tryOpenAI(message, systemPrompt);

    // If OpenAI fails, try OpenRouter
    if (!result) {
      result = await tryOpenRouter(message, systemPrompt);
    }

    // If OpenRouter fails, try Gemini
    if (!result) {
      result = await tryGemini(message, systemPrompt);
    }

    // If both fail, return error
    if (!result) {
      return NextResponse.json(
        { error: 'All AI services are currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
