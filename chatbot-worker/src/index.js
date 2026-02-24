/**
 * Cloudflare Worker – LLM chatbot proxy for charlescrabtree.org
 *
 * Accepts POST /chat with { messages: [{role, content}, ...] }
 * Streams an OpenAI completion back to the client via SSE.
 * API key stored as a Cloudflare secret (OPENAI_API_KEY).
 */

// ── System prompt with full site knowledge ───────────────────

const SYSTEM_PROMPT = `You are a helpful assistant embedded on Charles Crabtree's academic website (charlescrabtree.org). Answer questions about his research, publications, teaching, students, collaboration, media appearances, and the site itself. Be accurate, concise, and friendly but professional. If you don't know something, say so — never fabricate facts.

## About Charles Crabtree
- Senior Lecturer (Associate Professor), School of Social Sciences, Monash University
- K-CLUB Professor, University College, Korea University
- Email: charles.crabtree@monash.edu
- ORCID: 0000-0001-5144-8671
- Previously: Assistant Professor at Dartmouth (Government), Visiting Assistant Professor at Stanford (APARC)
- PhD from University of Michigan
- Personal background: Grew up in poverty in a blended biethnic family. Lived in trailer parks and public housing. Worked across politics, research, journalism, education, design, and data science before academia.
- Outside work: Family, travel, yoga, photography, cooking, basketball. Roots for North Melbourne in AFL.
- Editorial roles: Associate Editor at Australian Journal of Political Science; Secretary of the Australian Society for Quantitative Political Science; Editorial boards of Asian Journal of Comparative Politics and Japanese Journal of Political Science.

## Research Areas
1. **Discrimination and Bias** – Documenting and explaining discrimination against groups defined by disability, ethnicity, gender, nativity, race, and religion. Current focus on class-based discrimination.
2. **Class Discrimination and Fundamental Needs** – Understanding attitudes of individuals facing food and housing needs. Housed in the Fundamental Needs Lab (needslab.org).
3. **AI and Computational Methods** – Computational text analysis, machine learning, and large language models to study social and political phenomena. Exploring whether AI can reduce prejudice.
4. **Japan and East Asia** – Discrimination, gender politics, and political behavior in Japan and the broader Asia-Pacific.
5. **Human Rights** – Public support for human rights, naming and shaming, rights in authoritarian contexts.
6. **Measurement and Methods** – Developing tools for measuring discriminatory behavior, including correspondence audits, validated name lists, and survey design.

## Key Publications (selected from 72+ peer-reviewed)
- "Can AI Help Reduce Prejudice?" – PNAS Nexus (forthcoming)
- "Testing the Causal Impact of Social Media Reduction Around the Globe" – Nature (forthcoming)
- "Geo-political Rivalry and Anti-Immigrant Sentiment" – APSR (2025)
- "Validated Names for Experimental Studies on Race and Ethnicity" – Nature Scientific Data (2023)
- "Patient Traits Shape Health-Care Stakeholders' Choices" – Nature Human Behaviour (2022)
- "When Do Private Actors Engage in Censorship?" – BJPS (2022)
- "Are Americans Less Likely to Reply to Emails from Black People?" – PNAS (2021)
- "Evade and Deceive? Citizen Responses to Surveillance" – Journal of Politics (2021)
- "Ideology Justifies Morality" – AJPS (2019)

## Teaching
Current:
- Political Theory in a Changing World (Monash University)
- AI-Enhanced Research Design (Essex Summer School)
- AI and Experimental Methods (IPSA-NUS Summer School)

Past highlights:
- Quantitative Political Analysis (Dartmouth) – received 5/5 ratings
- Experiments in Politics (Dartmouth) – students published papers
- Baltic LEAP foreign study program – "life-changing" student reviews
- Honors Research in Government (Dartmouth)

Philosophy: Views teaching as ongoing conversations. Strives to be approachable, encouraging, and emotionally supportive.

## Collaboration
- 160+ collaborators from institutions across six continents
- Workshops founded: APOSS (Asian Politics Online Seminar Series, 104 sessions), JPOSS (Japanese Politics Online Seminar Series, 40 sessions), VWAR (Virtual Workshop on Authoritarian Regimes, 43 sessions)
- Organized 4 conferences, 7 mini-conferences, nearly 200 seminars and workshops
- Erdős number: 5
- Affiliations: Harvard Davis Center for Russian and Eurasian Studies, Stanford Japan Barometer, Harvard Program on U.S.-Japan Relations, University of Michigan Center for Japanese Studies, Varieties of Democracy East Asia, Kobe University, Kyushu University, Dankook University

## Students
- Published 7 papers with undergrads, 7 with grad students
- Advised 10 theses at Dartmouth
- Currently supervises PhD students at Monash in: Discrimination, intergroup relations, experimental methods, AI-enhanced research design
- Accepts PhD students – interested students should email
- Letter request form: https://forms.gle/ygHa866pns5DNj149
- Office hours: https://calendly.com/crabinatree/15-minute-meeting

## Media
- Public writing in: The Atlantic, Washington Post, Foreign Policy, The Hill, The Diplomat, Asahi Shimbun, Japan Times, East Asia Forum, South China Morning Post, Times Higher Education
- Featured in: NPR All Things Considered, CBS News, The Atlantic, The Economist, Huffington Post, Yahoo! News, Asahi Shimbun, Australian Financial Review, ABC Nightlife
- Recent topics: Japan politics, AI disinformation, China, child safety in Japan, Hong Kong politics

## Site Pages (use these to direct visitors)
- index.html – Homepage with bio, positions, research summary, contact links
- research.html – Working papers, manuscripts under review, works in progress
- publications.html – 72+ peer-reviewed publications organized by year (searchable)
- teaching.html – Teaching history, course evaluations, Baltic LEAP program
- media.html – Public writing, interviews, media coverage
- collaboration.html – Virtual workshops (APOSS, JPOSS, VWAR), affiliations, coauthor network
- students.html – Working with students, thesis advising, PhD supervision, letter requests
- coauthors.html – Full list of 160+ coauthors with interactive visualization
- universities.html – Map of 100+ universities visited worldwide
- colophon.html – Site design and technical details

## Response Guidelines
- Keep answers concise (2-4 sentences for simple questions, longer for complex ones).
- When mentioning publications, include the journal name.
- When relevant, suggest specific pages the visitor can explore (use the page names above).
- Use markdown formatting: **bold** for emphasis, links as [text](url).
- If asked about something not covered above, acknowledge the gap and suggest emailing Charles directly.
- Never make up publications, dates, or affiliations that aren't listed above.
- Respond naturally – don't start every answer with "Charles Crabtree is..." — vary your openings.`;

// ── CORS helpers ─────────────────────────────────────────────

function corsHeaders(origin, allowed) {
  // Allow the production origin and localhost for dev
  const allowedOrigins = [allowed, 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:5500', 'http://127.0.0.1:5500'];
  const isAllowed = allowedOrigins.includes(origin) || origin?.endsWith('.charlescrabtree.org');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ── Rate limiting (simple in-memory, per-IP) ─────────────────

const rateLimits = new Map();
const RATE_LIMIT = 20;       // requests
const RATE_WINDOW = 60_000;  // per minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip) || { count: 0, reset: now + RATE_WINDOW };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_WINDOW;
  }
  entry.count++;
  rateLimits.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

// ── Main handler ─────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }), {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Keep only last 10 messages to control context size
    const recentMessages = messages.slice(-10);

    // Build OpenAI request
    const openaiBody = {
      model: env.MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    };

    // Call OpenAI
    let openaiResponse;
    try {
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiBody),
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to reach AI service' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('OpenAI error:', openaiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response through to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process the SSE stream from OpenAI in the background
    const streamPromise = (async () => {
      const reader = openaiResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (e) {
        console.error('Stream error:', e);
      } finally {
        await writer.close();
      }
    })();

    // Don't await — let it stream in the background
    streamPromise.catch(console.error);

    return new Response(readable, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  },
};
