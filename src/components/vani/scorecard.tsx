import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Star,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  GitCompareArrows,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PageTitle, Pill, Avatar, Modal, Evidence, Note, EmptyState, Regression } from "./common";
import { versions, secondary, guardrails } from "./data";
const names = ["Meeting Fixed rate", ...secondary, ...guardrails];
const raw: Record<string, number[]> = {
  "Meeting Fixed rate": [11.5, 13.2, 9.8],
  "Call duration (seconds)": [74, 69, 81],
  "Answer rate": [68.4, 71.2, 66.1],
  "Location confirmed rate": [88.2, 91.4, 85.1],
  "Callback requested rate": [7.4, 8.1, 6.8],
  "Incorrect meeting-fixed rate": [1.2, 1.1, 2.3],
  "Do-not-call rate": [0.8, 0.7, 1.1],
  "Early drop rate": [12.8, 10.4, 17.1],
  "Bot response latency (P95)": [1.4, 1.3, 1.6],
  "Loopy / repeating calls rate": [2.1, 1.8, 3.4],
  "Seller had to repeat themselves rate": [3.4, 3.1, 4.5],
};
function Rating({ value, rawValue, calls }: { value: number; rawValue: string; calls: number }) {
  return (
    <span className="rating-cell" tabIndex={0} aria-label={`${value} out of 5, ${rawValue}`}>
      <span className="star-rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={i <= Math.round(value) ? "" : "empty"} />
        ))}
        <strong>{value.toFixed(1)}</strong>
      </span>
      <span className="rating-tooltip">
        <strong>{rawValue}</strong>
        <div className="ci-bar" />
        <small>Illustrative interval · confidence pending</small>
        <div className="sample-progress">
          <span className={calls >= 1500 ? "progress-A" : "progress-B"} />
        </div>
        <small>{calls.toLocaleString()} / 1,500 calls needed</small>
        <small>Star mapping is a product placeholder.</small>
      </span>
    </span>
  );
}
export function Scorecard() {
  const [group, setGroup] = useState("Primary + secondary");
  const [sort, setSort] = useState({ key: "Overall", dir: 0 });
  const [info, setInfo] = useState(false);
  const [compare, setCompare] = useState(false);
  const [left, setLeft] = useState("A");
  const [right, setRight] = useState("B");
  const [evidence, setEvidence] = useState(false);
  const [settings, setSettings] = useState(false);
  const [primary, setPrimary] = useState("Meeting Fixed rate");
  const [weights, setWeights] = useState<Record<string, string>>({ "Meeting Fixed rate": "40" });
  const [view, setView] = useState("ready");
  const [reject, setReject] = useState(false);
  const [mode, setMode] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [decision, setDecision] = useState("Inconclusive");
  const [promoted, setPromoted] = useState(false);
  const columns =
    group === "Primary"
      ? [primary]
      : group === "Secondary"
        ? secondary
        : group === "Guardrails"
          ? guardrails
          : group === "All"
            ? [primary, ...secondary, ...guardrails].filter((m, i, a) => a.indexOf(m) === i)
            : [primary, ...secondary.slice(0, 2)].filter((m, i, a) => a.indexOf(m) === i);
  const order = [...versions].sort((a, b) => {
    if (!sort.dir) return b.score - a.score;
    const aIndex = versions.indexOf(a),
      bIndex = versions.indexOf(b);
    const vals = raw[sort.key];
    const diff =
      sort.key === "Overall" ? a.score - b.score : (vals?.[aIndex] || 0) - (vals?.[bIndex] || 0);
    return sort.dir === 1 ? diff : -diff;
  });
  const cycle = (key: string) =>
    setSort((s) => ({ key, dir: s.key === key ? (s.dir + 1) % 3 : 1 }));
  const value = (metric: string, id: string) => {
    const n = raw[metric]?.[versions.findIndex((v) => v.id === id)] || 0;
    return `${n}${metric.includes("seconds") ? "s" : metric.includes("latency") ? "s" : "%"}`;
  };
  return (
    <>
      <PageTitle
        eyebrow="EXPERIMENT / SCORECARD"
        title="Evidence over instinct."
        description="Compare what matters. The best version earns its place, one metric at a time."
        action={
          <Button variant="outline" onClick={() => setSettings(true)}>
            <SlidersHorizontal />
            Metrics & weights
          </Button>
        }
      />
      <div className="section-heading">
        <div>
          <div className="section-kicker">
            <h2>How your versions measure up</h2>
            <Pill>Sample data</Pill>
          </div>
          <p>Primary metric: {primary}. Overall scores use an illustrative weighted average.</p>
        </div>
        <div className="help-popover">
          <Button
            variant="ghost"
            size="icon"
            title="How star ratings work"
            onClick={() => setInfo(!info)}
          >
            <Info />
          </Button>
          {info && (
            <div className="help-card">
              <strong>Stars, with the evidence underneath.</strong>
              <p>
                Ratings translate raw values into 1–5 stars. Hover a score for the raw value and
                sample progress.
              </p>
              <p>Example: 40% × 4.5 + 60% × 4.0 = 4.2 overall.</p>
              <p>Star mapping and weights are placeholders pending product approval.</p>
            </div>
          )}
        </div>
      </div>
      <div className="score-controls">
        <div className="segmented">
          {["Primary + secondary", "Primary", "Secondary", "Guardrails", "All"].map((g) => (
            <Button
              key={g}
              variant="ghost"
              className={g === group ? "active" : ""}
              onClick={() => setGroup(g)}
            >
              {g}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => setCompare(true)}>
          <GitCompareArrows />
          Compare versions
        </Button>
      </div>
      {view !== "ready" ? (
        <EmptyState state={view} onRetry={() => setView("ready")} />
      ) : (
        <div className="score-scroll">
          <table className="data-table score-table">
            <thead>
              <tr>
                <th>Prompt version</th>
                {["Overall", ...columns].map((m) => (
                  <th
                    key={m}
                    className={`${sort.key === m && sort.dir ? "active-column" : ""} ${guardrails.includes(m) ? "guardrail-cell" : ""}`}
                  >
                    <Button variant="ghost" onClick={() => cycle(m)}>
                      {m === "Overall" ? "Overall quality" : m}
                      {sort.key === m && sort.dir ? (
                        sort.dir === 1 ? (
                          <ArrowUp size={11} />
                        ) : (
                          <ArrowDown size={11} />
                        )
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </Button>
                  </th>
                ))}
                <th>Outlook</th>
              </tr>
            </thead>
            <tbody>
              {order.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="score-version">
                      <Avatar id={v.id} />
                      <div>
                        <strong>
                          Version {v.id} {v.id === "A" && <Pill>Baseline</Pill>}
                        </strong>
                        <small>{v.title}</small>
                      </div>
                    </div>
                    <Regression />
                  </td>
                  <td>
                    <Rating
                      value={v.score}
                      rawValue={`Overall quality score ${v.score}/5`}
                      calls={v.calls}
                    />
                  </td>
                  {columns.map((m, i) => (
                    <td key={m} className={guardrails.includes(m) ? "guardrail-cell" : ""}>
                      <Rating
                        value={Math.min(5, Math.max(1, v.score + (i % 2 ? 0.2 : -0.1)))}
                        rawValue={`${m}: ${value(m, v.id)}`}
                        calls={v.calls}
                      />
                    </td>
                  ))}
                  <td>
                    <Pill tone={v.id === "B" ? "green" : v.id === "C" ? "amber" : "neutral"}>
                      {v.id === "B" ? "Leading" : v.id === "C" ? "Underperforming" : "On track"}
                    </Pill>
                    <div className="sample-progress">
                      <span className={`progress-${v.id}`} />
                    </div>
                    <small className="neutral-text text-[8px]">
                      {Math.min(100, Math.round((v.calls / 1500) * 100))}% sample collected
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="table-footer">
        <span>
          <ShieldCheck size={12} />
          Leading does not mean ready to promote.
        </span>
        <select
          className="state-select"
          aria-label="Scorecard preview state"
          value={view}
          onChange={(e) => setView(e.target.value)}
        >
          <option value="ready">Results available</option>
          <option value="empty">Empty state</option>
          <option value="loading">Loading state</option>
          <option value="error">Error state</option>
        </select>
      </div>
      <div className="decision-banner">
        <span className="decision-icon">
          {decision === "Promote" ? <Check size={17} /> : <Clock size={17} />}
        </span>
        <div>
          <div className="section-kicker">
            <h3>
              {decision === "Promote"
                ? "Version B promoted · Simulated"
                : decision === "Reject"
                  ? "Candidate rejected · Baseline stays"
                  : "Promising, but not proven yet."}
            </h3>
            <Pill tone={decision === "Promote" ? "green" : "amber"}>{decision}</Pill>
          </div>
          <p>
            {decision === "Inconclusive"
              ? "B’s Meeting Fixed rate is +1.7 pp above A, but the illustrative interval still includes no improvement. Keep the baseline."
              : decision === "Promote"
                ? "Illustrative complete-data state · approved rule and evidence must be supplied by your product team."
                : "Illustrative rejected state · production decisions require approved rules and evidence."}
          </p>
          <Button variant="link" size="sm" className="px-0 mt-1" onClick={() => setEvidence(true)}>
            See the evidence
            <ArrowUpRight />
          </Button>
        </div>
        {promoted ? (
          <Button
            variant="outline"
            onClick={() => {
              setDecision("Inconclusive");
              setPromoted(false);
              toast.success("Simulated rollback to baseline A complete");
            }}
          >
            <RotateCcw />
            Roll back to A
          </Button>
        ) : (
          <Button disabled>Await more evidence</Button>
        )}
      </div>
      <div className="rejection-panel">
        <div>
          <h3>
            {reviewed ? "Version C · review recorded" : "Version C needs a closer look."}{" "}
            <Pill tone="amber">Approval needed</Pill>
          </h3>
          <p>Underperforming on sample data. Rejection strategy is pending product definition.</p>
          <Button variant="link" size="sm" className="px-0 mt-1" onClick={() => setReject(true)}>
            Review recommendation
            <ArrowUpRight />
          </Button>
        </div>
        <div className="actions">
          <Button
            variant="outline"
            onClick={() => {
              setReviewed(true);
              toast("Version C kept in the simulated test");
            }}
          >
            Keep testing
          </Button>
          <Button variant="outline" onClick={() => setReject(true)}>
            Review rejection
          </Button>
        </div>
      </div>
      <div className="table-footer">
        <span>
          <Info size={12} />
          Decision outcomes preview
        </span>
        <div className="segmented">
          {["Inconclusive", "Promote", "Reject"].map((d) => (
            <Button
              key={d}
              variant="ghost"
              className={decision === d ? "active" : ""}
              onClick={() => {
                setDecision(d);
                setPromoted(d === "Promote");
              }}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
      {promoted && (
        <div className="scale-recap">
          <div>
            <h3>Ready for a controlled rollout?</h3>
            <p>Preview new segments before allocating traffic.</p>
          </div>
          <Button asChild>
            <Link to="/scale-up">
              Scale to segment
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
      )}
      <Modal open={evidence} onOpenChange={setEvidence} title="Why this result is inconclusive">
        <Evidence />
        <div className="history-row">
          <Clock size={17} />
          <div>
            <strong>Action history</strong>
            <p>No automatic promotions. Baseline A remains live.</p>
          </div>
          <Pill>Sample history</Pill>
        </div>
      </Modal>
      <Modal open={compare} onOpenChange={setCompare} title="Compare any two versions">
        <div className="field-grid">
          <select
            className="form-input"
            aria-label="First comparison version"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Version {v.id} · {v.id === "A" ? "Baseline" : v.name}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            aria-label="Second comparison version"
            value={right}
            onChange={(e) => setRight(e.target.value)}
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Version {v.id} · {v.name}
              </option>
            ))}
          </select>
        </div>
        {left === right ? (
          <Note>Choose two different versions to compare.</Note>
        ) : (
          <>
            {[primary, ...secondary.slice(0, 2), ...guardrails.slice(0, 2)].map((m) => (
              <div className="comparison-row" key={m}>
                <strong>{m}</strong>
                <span>{value(m, left)}</span>
                <span>{value(m, right)}</span>
                <Pill tone={m === primary ? "amber" : "green"}>
                  {m === primary
                    ? "No proven difference"
                    : right === "B"
                      ? "Better in sample"
                      : "Sample difference"}
                </Pill>
              </div>
            ))}
            <Note>
              Metric deltas are illustrative; significance and guardrail checks are pending approved
              decision rules.
            </Note>
          </>
        )}
      </Modal>
      <Modal open={settings} onOpenChange={setSettings} title="Metrics & weights">
        <label className="field-label">Primary metric</label>
        <select className="form-input" value={primary} onChange={(e) => setPrimary(e.target.value)}>
          {names.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <Note>
          Weighting and raw-value-to-star mapping are placeholders pending product approval.
        </Note>
        {names.map((m) => (
          <div className="metric-settings-row" key={m}>
            <span>{m}</span>
            <label>
              Weight
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                aria-label={`${m} weight`}
                value={weights[m] || "10"}
                onChange={(e) => setWeights({ ...weights, [m]: e.target.value })}
              />
              %
            </label>
          </div>
        ))}
        <Button
          onClick={() => {
            setSettings(false);
            toast.success("Demo metric preferences saved");
          }}
        >
          Save preferences
        </Button>
      </Modal>
      <Modal open={reject} onOpenChange={setReject} title="Review Version C rejection">
        <div className="form-summary">
          <span>Meeting Fixed rate</span>
          <strong>9.8% vs baseline 11.5%</strong>
        </div>
        <label className="setting-row">
          <span>
            Auto-reject <Pill>Placeholder</Pill>
            <p className="field-help">Off: reject only on my approval</p>
          </span>
          <Switch checked={mode} onCheckedChange={setMode} />
        </label>
        <div className="pending-slot">
          <strong>Why · Evidence and rule</strong>
          <br />
          Pending product definition. Do not infer an approved rejection rule from these sample
          results.
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setReject(false);
              setReviewed(true);
              toast("Version C kept testing");
            }}
          >
            Keep testing
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setReject(false);
              setReviewed(true);
              toast("Simulated rejection approved · no production change");
            }}
          >
            Approve rejection
          </Button>
        </div>
      </Modal>
    </>
  );
}
