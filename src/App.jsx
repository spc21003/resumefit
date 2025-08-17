import { useMemo, useState } from "react";
import resumeFitLogo from "./assets/resumefitlogo.png";
import React from 'react';            // add this



export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canAnalyze = useMemo(() => {
    return resumeText.trim().length > 40 && jobText.trim().length > 40 && !loading;
  }, [resumeText, jobText, loading]);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setMatchScore(null);
    setAnalysis("");
    try {
      const response = await fetch(
        import.meta.env.VITE_MATCH_ENDPOINT || "http://127.0.0.1:8000/match",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeText, job_desc: jobText }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Accept multiple backend shapes:
      // { result: number } | { result: string } | { score, analysis }
      let text = "";
      let score = null;

      if (typeof data === "string") {
        text = data;
      } else if (typeof data.result === "string") {
        text = data.result;
      } else if (typeof data.result === "number") {
        score = data.result;
      }
      if (typeof data.analysis === "string") {
        text = data.analysis;
      }
      if (typeof data.score === "number") {
        score = data.score;
      }

      // If score not provided, try to parse a number 0-100 from the text
      if (score == null && text) {
        const m = text.match(/([0-9]{1,3})\s*%|match\s*score\s*:?\s*([0-9]{1,3})/i);
        if (m) {
          score = Math.max(0, Math.min(100, parseInt(m[1] || m[2], 10)));
        }
      }

      setAnalysis(text || "");
      if (score != null && !Number.isNaN(score)) setMatchScore(score);
    } catch (err) {
      console.error("API error:", err);
      setError("Couldn't reach the analyzer. Check your backend URL and CORS.");
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    setResumeText(jobText);
    setJobText(resumeText);
  }

  function handleClear() {
    setResumeText("");
    setJobText("");
    setMatchScore(null);
    setAnalysis("");
    setError(null);
  }

  return (
    <div className="ra-page">
      <div className="ra-root">
        <header className="ra-header">
          <img
            src={resumeFitLogo}
            alt="ResumeFit"
            className="ra-logo"
            width={500}
            height="auto"
            decoding="async"
          />
        </header>
        <div className="ra-actions">
          <button type="button" className="ra-btn ghost" onClick={handleSwap} aria-label="Swap inputs">
            ⇄ Swap
          </button>
          <div className="spacer" />
          <button type="button" className="ra-btn ghost" onClick={handleClear}>Clear</button>
        </div>

        <main className="ra-grid">
          <section className="ra-card">
            <label htmlFor="resume" className="ra-label">Resume</label>
            <textarea
              id="resume"
              className="ra-textarea"
              placeholder="Paste your resume here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="ra-hint">Tip: Use your full resume. Minimum ~40 characters.</div>
          </section>

          <section className="ra-card">
            <label htmlFor="job" className="ra-label">Job Description</label>
            <textarea
              id="job"
              className="ra-textarea"
              placeholder="Paste the job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <div className="ra-hint">Paste the entire JD for best results.</div>
          </section>
        </main>

        <div className="ra-cta">
          <button className="ra-btn primary" onClick={handleAnalyze} disabled={!canAnalyze}>
            {loading ? "Analyzing…" : "Analyze Match"}
          </button>
          {!canAnalyze && !loading && (
            <div className="ra-cta-hint">Enter both texts (≥ ~40 chars) to enable analysis.</div>
          )}
        </div>

        {error && (
          <div className="ra-alert" role="alert">
            <strong>Connection issue.</strong> {error}
          </div>
        )}

        {(matchScore !== null || analysis) && (
          <section className="ra-result" aria-live="polite">
            <div className="ra-result-top">
              <span className="ra-result-label">Match Score</span>
              <span className="ra-result-value">{matchScore != null ? Math.round(matchScore) : "—"}%</span>
            </div>
            <div className="ra-progress" aria-hidden="true">
              <div className="ra-progress-bar" style={{ width: `${Math.max(0, Math.min(100, matchScore || 0))}%` }} />
            </div>
            {analysis && (
              <div className="ra-analysis" data-testid="analysis">
                {analysis.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para.split("\n").map((line, j) => (<>
                    {line}
                    {j < para.split("\n").length - 1 ? <br/> : null}
                  </>))}</p>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="ra-footer">
          <small>
            Built by Sean Colello.
          </small>
        </footer>
      </div>
      <style>{`
        :root{
        /* Light theme tokens */
        --bg:#dcd4d6;
        --panel:#fefbf9;
        --card:#ffffff;
        --text:#0f172a;
        --muted:#64748b;            /* slate-500 */
        --primary:#2563eb;          /* blue-600 */
        --ring: rgba(37,99,235,.28);
        --border:#e5e7eb;           /* gray-200 */
        --shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06);
        --radius:12px;
      }

      /* Base layout */
      *{box-sizing:border-box}
      html,body,#root{height:100%;width:100%;margin:0;padding:0}
      body{
        display:flex;align-items:center;justify-content:center;
        background:var(--bg); color:var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        font-size: 30px;
      }

      /* Page container */
      .ra-page{display:flex;align-items:center;justify-content:center;width:100%;height:100%;padding:24px}
      .ra-root{
        width:95%;max-width:1200px;min-height:70%;
        display:flex;flex-direction:column;
        padding:32px;background:var(--panel);
        border:1px solid var(--border); border-radius:var(--radius);
        box-shadow:var(--shadow); overflow:auto
      }

      /* Header */
      .ra-header{display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;margin-bottom:12px}
      .ra-title{display:flex;align-items:center;gap:10px}
      .ra-title h1{margin:0;font-size:clamp(32px,4vw,44px);letter-spacing:.2px}
      .ra-sub{margin:0;color:var(--muted);font-size:1rem}

      /* Actions */
      .ra-actions{display:flex;align-items:center;gap:10px;margin:16px 0}
      .spacer{flex:1}

      /* Grid */
      .ra-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;flex:1}
      @media (max-width:980px){.ra-grid{grid-template-columns:1fr}}

      /* Cards */
      .ra-card{
        display:flex;flex-direction:column;flex:1;
        background:var(--card);
        border:3px solid var(--border);
        border-radius:var(--radius);
        padding:16px; box-shadow:0 1px 2px rgba(0,0,0,.04)  
      }
      .ra-label{display:block;font-weight:600;color:#0f172a;margin-bottom:8px;font-size:1.8rem}
      .ra-textarea{
        flex:1;width:100%;padding:14px 16px;resize:vertical;min-height:180px;
        border-radius:10px;border:3px solid var(--border);outline:none;
        background:#fff;color:var(--text);font-size:1.15rem;line-height:1.7;
        transition:box-shadow .16s,border-color .16s;
      }
      .ra-textarea:focus{box-shadow:0 0 0 4px var(--ring);border-color:var(--primary)}
      .ra-hint{margin-top:8px;color:var(--muted);font-size:1.05rem}

      /* CTA */
      .ra-cta{display:flex;flex-direction:column;align-items:center;gap:8px;margin:20px 0 8px}
      .ra-cta-hint{color:var(--muted);font-size:1.05rem}

      /* Buttons */
      .ra-btn{
        border:3px solid transparent;border-radius:10px;padding:12px 20px;
        font-weight:600;font-size:1.1rem;cursor:pointer;
        box-shadow:0 1px 2px rgba(0,0,0,.06);transition:transform .08s ease,filter .2s ease,background .2s ease,opacity .2s,border-color .2s;
      }
      .ra-btn:active{transform:translateY(1px)}
      .ra-btn[disabled]{cursor:not-allowed;opacity:.6}
      .ra-btn.primary{background:var(--primary);color:white}
      .ra-btn.primary:hover:not([disabled]){filter:brightness(1.05)}
      .ra-btn.ghost{background:#fff;color:var(--text);border-color:var(--border)}
      .ra-btn.ghost:hover{background:#f8fafc}

      /* Alerts */
      .ra-alert{
        margin:14px 0;padding:16px 18px;
        border:1px solid #fecaca;background:#fff1f2;color:#7f1d1d;
        border-radius:10px
      }

      /* Result block */
      .ra-result{
        margin-top:12px;background:#fff;
        border:3px solid var(--border);border-radius:var(--radius);
        padding:24px;box-shadow:0 1px 2px rgba(0,0,0,.04)
      }
      .ra-result-top{display:flex;align-items:baseline;gap:12px;justify-content:space-between}
      .ra-result-label{color:#334155;font-weight:600;font-size:1.8rem}
      .ra-result-value{font-size:clamp(36px,5vw,56px);font-weight:800;letter-spacing:.2px}
      .ra-progress{height:12px;background:#f1f5f9;border-radius:999px;overflow:hidden;margin-top:8px;border:1px solid var(--border)}
      .ra-progress-bar{height:100%;background:var(--primary)}
      .ra-analysis{margin-top:12px;white-space:pre-wrap;line-height:1.8;color:#0f172a;font-size:1.32rem}
      .ra-result-note{margin-top:10px;color:var(--muted);font-size:1.05rem}

      /* Footer */
      .ra-footer{margin-top:24px;color:var(--muted);text-align:center;font-size:1rem}
      code{background:#f8fafc;padding:2px 6px;border-radius:6px;border:1px solid var(--border)}
      `}</style>
    </div>
  );
}
