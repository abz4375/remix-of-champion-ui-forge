import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  AudioLines,
  FlaskConical,
  FileText,
  ChartNoAxesColumnIncreasing,
  Layers,
  Workflow,
  Bell,
  ChevronDown,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
  Check,
  Settings2,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Modal, Pill } from "./common";
const nav = [
  { label: "Experiment setup", path: "/setup", icon: FlaskConical },
  { label: "Prompts", path: "/prompts", icon: FileText },
  { label: "Scorecard", path: "/scorecard", icon: ChartNoAxesColumnIncreasing },
  { label: "Scale-up", path: "/scale-up", icon: Layers },
  { label: "Live pipeline", path: "/", icon: Workflow },
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [settings, setSettings] = useState(false);
  const [user, setUser] = useState(false);
  const [selector, setSelector] = useState(false);
  const [experiment, setExperiment] = useState("Shorter opening vs baseline");
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-symbol">
            <AudioLines size={23} />
          </span>
          {!collapsed && (
            <span>
              VANI <b>Lab</b>
            </span>
          )}
        </Link>
        <div className="workspace-label">{!collapsed && "WORKSPACE"}</div>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <Button
              key={n.path}
              asChild
              variant="ghost"
              className={`nav-item ${path === n.path ? "active" : ""}`}
              title={n.label}
            >
              <Link to={n.path}>
                <n.icon size={18} />
                {!collapsed && <span>{n.label}</span>}
                {path === n.path && !collapsed && <span className="nav-dot" />}
              </Link>
            </Button>
          ))}
        </nav>
        {!collapsed && (
          <div className="sidebar-experiment">
            <span className="eyebrow">CURRENT EXPERIMENT</span>
            <strong>{experiment}</strong>
            <span className="sidebar-live">
              <i className="live-dot" /> Live test in progress
            </span>
            <div className="mini-progress">
              <span />
            </div>
            <small>
              Day 2 of 7 <span>29%</span>
            </small>
          </div>
        )}
        <div className="sidebar-bottom">
          {!collapsed && (
            <>
              <div className="safety-mark">
                <ShieldCheck size={16} />
                <span>Built for safer decisions</span>
              </div>
              <Button
                variant="ghost"
                className="nav-item"
                onClick={() => toast("VANI Lab · experiment → evaluate → test → decide → scale")}
              >
                <CircleHelp />
                Help & resources
                <ArrowUpRight size={14} />
              </Button>
              <div className="indiamart">
                india<span>MART</span>
                <small>VOICE AI WORKSPACE</small>
              </div>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="experiment-picker">
            <Button variant="ghost" onClick={() => setSelector(!selector)}>
              <FlaskConical size={16} />
              {experiment}
              <ChevronDown />
            </Button>
            {selector && (
              <div className="header-dropdown">
                <span className="eyebrow">EXPERIMENTS</span>
                {["Shorter opening vs baseline", "Hinglish greeting exploration"].map((e) => (
                  <Button
                    key={e}
                    variant="ghost"
                    onClick={() => {
                      setExperiment(e);
                      setSelector(false);
                      toast("Demo experiment selected");
                    }}
                  >
                    {e}
                    {experiment === e && <Check />}
                  </Button>
                ))}
                <Button asChild variant="outline">
                  <Link to="/setup">
                    <Plus />
                    New experiment
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <Pill tone="green">
            <i className="live-dot" />
            Live
          </Pill>
          <div className="topbar-right">
            <span className="sample-label">Synthetic data</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setAlerts(!alerts)}
              className="bell-button"
            >
              <Bell />
              <i />
            </Button>
            <span className="header-divider" />
            <Button variant="ghost" onClick={() => setUser(!user)} aria-label="User menu">
              <span className="user-avatar">AS</span>
              <ChevronDown />
            </Button>
          </div>
          {alerts && (
            <div className="notification-panel">
              <div className="flex justify-between items-center">
                <h3>
                  Notifications <Pill>3 new</Pill>
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Notification settings"
                  onClick={() => {
                    setAlerts(false);
                    setSettings(true);
                  }}
                >
                  <Settings2 />
                </Button>
              </div>
              {[
                "Decision waiting for approval",
                "Version C flagged for review",
                "Pre-prod evaluations passed",
                "Test window ends in 5 days",
              ].map((t, i) => (
                <div className="notification" key={t}>
                  <span className={`notification-dot ${i < 3 ? "unread" : ""}`} />
                  <div>
                    <strong>{t}</strong>
                    <p>{experiment}</p>
                    <small>{i + 1}h ago · Sample alert</small>
                  </div>
                  <Button asChild variant="link" size="sm">
                    <Link to={i === 2 ? "/" : "/scorecard"} onClick={() => setAlerts(false)}>
                      Review
                    </Link>
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setAlerts(false);
                  toast.success("All notifications marked as read");
                }}
              >
                Mark all as read
              </Button>
            </div>
          )}
          {user && (
            <div className="user-panel">
              <strong>Ayush Srivastava</strong>
              <p>Voice AI team · Demo workspace</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setUser(false);
                  setSettings(true);
                }}
              >
                <Settings2 />
                Notification preferences
              </Button>
            </div>
          )}
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">
          <span>
            <ShieldCheck size={13} /> Synthetic data only. No live calls are placed.
          </span>
          <span>
            VANI Lab <span className="footer-dot">·</span> IndiaMART Voice AI
          </span>
        </footer>
      </div>
      <Modal open={settings} onOpenChange={setSettings} title="Notification preferences">
        {[
          "Guardrail breached",
          "Version flagged for rejection",
          "Early stop triggered",
          "Test ended",
          "Decision awaiting approval",
          "Also send to WhatsApp · Placeholder",
        ].map((t) => (
          <label className="setting-row" key={t}>
            <span>{t}</span>
            <Switch defaultChecked={!t.includes("WhatsApp")} />
          </label>
        ))}
      </Modal>
    </div>
  );
}
