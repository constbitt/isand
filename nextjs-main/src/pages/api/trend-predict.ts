import type { NextApiRequest, NextApiResponse } from 'next';

type ErrBody = { error: string; details?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<unknown | ErrBody>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Публичный Gradio Space; при необходимости переопределяется через TREND_CLASSIFIER_URL
  const DEFAULT_TREND_CLASSIFIER = 'https://7nasty7-trend-classifier.hf.space';
  const base =
    (process.env.TREND_CLASSIFIER_URL &&
      String(process.env.TREND_CLASSIFIER_URL).trim()) ||
    DEFAULT_TREND_CLASSIFIER;

  const url = `${String(base).replace(/\/$/, '')}/batch-predict-raw`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60_000);

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: controller.signal,
    });
    const text = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: 'Upstream error',
        details: text?.slice(0, 2000) || r.statusText,
      });
    }
    const data = text ? JSON.parse(text) : {};
    return res.status(200).json(data);
  } catch (e) {
    const m = e instanceof Error ? e.message : 'request failed';
    return res.status(500).json({ error: m });
  } finally {
    clearTimeout(t);
  }
}

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };
