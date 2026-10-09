import { useRef, useState } from "react";
import { useBlocker } from "@tanstack/react-router";
import { Plus, Search, GitCompareArrows, History, Copy, Lock, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageTitle, Pill, Avatar, Modal, Note } from "./common";
import { versions, promptText } from "./data";
type PromptVersion = { id: string; title: string; status: string; text: string; note: string };
export function Prompts() {
  const [list, setList] = useState<PromptVersion[]>(
    versions.map((v) => ({
      id: v.id,
      title: v.title,
      status: v.status,
      text:
        promptText +
        (v.id === "B"
          ? "\n\n## Candidate B adjustment\nKeep the opening under 12 seconds. Ask for a meeting directly."
          : v.id === "C"
            ? "\n\n## Candidate C adjustment\nStart in Hinglish; switch language if the seller prefers."
            : ""),
      note: "Initial experiment version",
    })),
  );
  const [id, setId] = useState("B");
  const selected = list.find((v) => v.id === id) || list[0];
  const [text, setText] = useState(selected?.text || promptText);
  const [save, setSave] = useState(false);
  const [note, setNote] = useState("");
  const [compare, setCompare] = useState(false);
  const [compareId, setCompareId] = useState("A");
  const [history, setHistory] = useState(false);
  const [find, setFind] = useState(false);
  const [query, setQuery] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const findNext = () => {
    const editor = editorRef.current;
    if (!editor || !query) return;
    const lower = text.toLowerCase();
    let at = lower.indexOf(query.toLowerCase(), editor.selectionEnd);
    if (at < 0) at = lower.indexOf(query.toLowerCase());
    if (at < 0) {
      toast("No matching text");
      return;
    }
    editor.focus();
    editor.setSelectionRange(at, at + query.length);
    editor.scrollTop = Math.max(0, (text.slice(0, at).split("\n").length - 4) * 24);
  };
  const [error, setError] = useState("");
  const dirty = text !== selected?.text;
  const readonly = selected?.status !== "Draft";
  const blocker = useBlocker({
    shouldBlockFn: () => dirty,
    enableBeforeUnload: dirty,
    withResolver: true,
  });
  const choose = (v: PromptVersion) => {
    if (dirty) {
      toast("Save or discard your changes before switching versions");
      return;
    }
    setId(v.id);
    setText(v.text);
  };
  const duplicate = () => {
    const next = String.fromCharCode(65 + list.length);
    const item = {
      id: next,
      title: `Draft from Version ${id}`,
      status: "Draft",
      text,
      note: `Duplicated from Version ${id}`,
    };
    setList([...list, item]);
    setId(next);
    setText(item.text);
    toast.success(`Version ${next} draft created`);
  };
  const commit = () => {
    if (!note.trim()) {
      setError("Add a changelog note.");
      return;
    }
    if (!text.trim()) {
      setError("The prompt cannot be empty.");
      return;
    }
    const next = String.fromCharCode(65 + list.length);
    const item = { id: next, title: note, status: "Saved", text, note };
    setList([...list, item]);
    setId(next);
    setText(item.text);
    setSave(false);
    setNote("");
    setError("");
    toast.success(`Version ${next} saved without overwriting ${id}`);
  };
  return (
    <>
      <PageTitle
        eyebrow="EXPERIMENT / PROMPTS"
        title="Every word makes a difference."
        description="Shape the conversation. Keep every version, and every change, traceable."
        action={
          <Button onClick={duplicate}>
            <Plus />
            New variant
          </Button>
        }
      />
      <div className="prompt-layout">
        <aside className="prompt-rail">
          <div className="prompt-rail-heading">
            <span className="eyebrow">PROMPT VERSIONS</span>
            <Button
              variant="ghost"
              size="icon"
              title="Version history"
              onClick={() => setHistory(true)}
            >
              <History />
            </Button>
          </div>
          {list.map((v) => (
            <Button
              variant="ghost"
              key={v.id}
              className={`prompt-option ${id === v.id ? "active" : ""}`}
              onClick={() => choose(v)}
            >
              <Avatar id={v.id} small />
              <div>
                <strong>
                  Version {v.id}{" "}
                  <Pill tone={v.status === "Draft" ? "amber" : v.id === "A" ? "green" : "blue"}>
                    {v.status}
                  </Pill>
                </strong>
                <p>{v.title}</p>
                <small>Voice AI team · 08 Oct, 10:24</small>
              </div>
            </Button>
          ))}
        </aside>
        <div className="prompt-main">
          <div className="editor-toolbar">
            <div>
              <h3>
                Version {id}{" "}
                {readonly ? (
                  <Pill>
                    <Lock size={10} />
                    Read-only
                  </Pill>
                ) : (
                  <Pill tone="amber">Draft</Pill>
                )}
                {dirty && <Pill tone="amber">Unsaved changes</Pill>}
              </h3>
              <small>{selected?.title}</small>
            </div>
            <div className="editor-toolbar-actions">
              <Button
                variant="ghost"
                size="icon"
                title="Find in prompt"
                onClick={() => setFind(!find)}
              >
                <Search />
              </Button>
              <Button variant="outline" onClick={() => setCompare(true)}>
                <GitCompareArrows />
                Compare
              </Button>
              <Button variant="outline" onClick={duplicate}>
                <Copy />
                Duplicate
              </Button>
            </div>
          </div>
          {readonly && (
            <div className="inline-note px-5 py-3 border-b">
              <Lock size={13} />
              <span>Saved and in-test prompts are immutable. Duplicate to edit a new variant.</span>
            </div>
          )}
          {find && (
            <div className="editor-find">
              <Search size={14} />
              <input
                className="form-input"
                aria-label="Find text"
                placeholder="Find in prompt…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") findNext();
                }}
              />
              <span>
                {query
                  ? `${text.toLowerCase().split(query.toLowerCase()).length - 1} matches`
                  : "Type to search"}
              </span>
              <Button variant="outline" size="sm" disabled={!query} onClick={findNext}>
                Next match
              </Button>
            </div>
          )}
          <div className="editor-body">
            <div className="editor-line-numbers" aria-hidden="true">
              {text.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={editorRef}
              className="prompt-textarea"
              aria-label={`Version ${id} prompt editor`}
              spellCheck={false}
              value={text}
              readOnly={readonly}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="editor-footer">
            <span>English / Hindi / Hinglish</span>
            <span>
              {text.split("\n").length} lines · {text.length} characters
            </span>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <Button
          variant="ghost"
          disabled={!dirty}
          onClick={() => {
            setText(selected?.text || "");
            toast("Changes discarded");
          }}
        >
          <RotateCcw />
          Discard changes
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setHistory(true)}>
            <History />
            Version history
          </Button>
          <Button disabled={!dirty} onClick={() => setSave(true)}>
            <Save />
            Save as new version
          </Button>
        </div>
      </div>
      <Modal open={save} onOpenChange={setSave} title="Save as a new version">
        <Note>Version {id} stays untouched. A new immutable version is created.</Note>
        <label className="field-label" htmlFor="changelog">
          Changelog note
        </label>
        <textarea
          id="changelog"
          className="form-input"
          placeholder="What changed, and why?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p className="validation-error">{error}</p>}
        <Button onClick={commit}>Save new version</Button>
      </Modal>
      <Modal open={compare} onOpenChange={setCompare} title={`Compare Version ${id}`}>
        <select
          className="form-input"
          aria-label="Compare with version"
          value={compareId}
          onChange={(e) => setCompareId(e.target.value)}
        >
          {list
            .filter((v) => v.id !== id)
            .map((v) => (
              <option value={v.id} key={v.id}>
                Version {v.id} · {v.title}
              </option>
            ))}
        </select>
        <div className="diff-grid">
          <div>
            <h3>Version {compareId}</h3>
            <pre>{list.find((v) => v.id === compareId)?.text}</pre>
          </div>
          <div>
            <h3>Version {id}</h3>
            <pre>
              {text.split("\n").map((line, i) => (
                <span
                  key={i}
                  className={
                    !list.find((v) => v.id === compareId)?.text.includes(line) ? "diff-added" : ""
                  }
                >
                  {line}
                  {"\n"}
                </span>
              ))}
            </pre>
          </div>
        </div>
        <Note>Highlighted lines are additions relative to the selected version.</Note>
      </Modal>
      <Modal open={history} onOpenChange={setHistory} title="Version history">
        {list
          .slice()
          .reverse()
          .map((v) => (
            <div className="history-row" key={v.id}>
              <Avatar id={v.id} />
              <div>
                <strong>
                  Version {v.id} · {v.status}
                </strong>
                <p>{v.note}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setHistory(false);
                  choose(v);
                  toast("Version selected. Duplicate to restore as a new variant.");
                }}
              >
                Restore
              </Button>
            </div>
          ))}
      </Modal>
      <Modal
        open={blocker.status === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.status === "blocked") blocker.reset();
        }}
        title="Leave unsaved changes?"
      >
        <Note>Your draft changes have not been saved.</Note>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (blocker.status === "blocked") blocker.reset();
            }}
          >
            Keep editing
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (blocker.status === "blocked") blocker.proceed();
            }}
          >
            Discard and leave
          </Button>
        </div>
      </Modal>
    </>
  );
}
