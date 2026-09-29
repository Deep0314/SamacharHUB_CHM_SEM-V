import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { getAdminToken } from "@/lib/auth";
import { Save, Send, Trash2, Users, Mail, TestTube, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

const API = "/api";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

interface Subscriber {
  _id: string;
  email: string;
  name: string;
  subscribedAt: string;
}

const DEFAULT_SMTP: SmtpConfig = { host: "", port: 587, secure: false, user: "", pass: "", fromName: "SamacharHUB", fromEmail: "" };

export default function NotificationsPage() {
  const { toast } = useToast();
  const [smtp, setSmtp] = useState<SmtpConfig>(DEFAULT_SMTP);
  const [loadingSmtp, setLoadingSmtp] = useState(true);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const [activeTab, setActiveTab] = useState<"smtp" | "subscribers" | "broadcast">("smtp");

  async function loadSmtp() {
    const res = await fetch(`${API}/settings`);
    if (res.ok) {
      const data = await res.json();
      setSmtp({ ...DEFAULT_SMTP, ...(data.smtpConfig || {}) });
    }
    setLoadingSmtp(false);
  }

  async function loadSubscribers() {
    const token = getAdminToken();
    const res = await fetch(`${API}/admin/subscribers`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSubscribers(await res.json());
    setLoadingSubs(false);
  }

  useEffect(() => { loadSmtp(); loadSubscribers(); }, []);

  async function handleSaveSmtp() {
    setSavingSmtp(true);
    const token = getAdminToken();
    const res = await fetch(`${API}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ smtpConfig: smtp }),
    });
    if (res.ok) toast({ title: "SMTP settings saved" });
    else toast({ title: "Failed to save SMTP settings", variant: "destructive" });
    setSavingSmtp(false);
  }

  function friendlySmtpError(error: string): string {
    if (error.includes("ENOTFOUND")) {
      const host = error.replace("getaddrinfo ENOTFOUND", "").trim();
      if (host.includes("@")) return `The SMTP Host field contains an email address ("${host}"). It should be a server name like smtp.gmail.com — use Quick fill above.`;
      return `Cannot reach host "${host}". Check that the SMTP Host is correct (e.g. smtp.gmail.com).`;
    }
    if (error.includes("ECONNREFUSED")) return "Connection refused. Check the host and port — port 587 is standard for Gmail.";
    if (error.includes("ETIMEDOUT") || error.includes("ECONNRESET")) return "Connection timed out. The server didn't respond. Check the host/port.";
    if (error.includes("535") || error.includes("534") || error.includes("Username and Password")) return "Authentication failed. For Gmail, use an App Password (not your regular Gmail password). Enable 2FA in Google Account settings first.";
    if (error.includes("STARTTLS") || error.includes("SSL") || error.includes("TLS")) return "SSL/TLS error. Try toggling the SSL/TLS option, or change the port (587 for TLS, 465 for SSL).";
    return error;
  }

  async function handleTestSmtp() {
    if (smtp.host.includes("@")) {
      setTestResult({ ok: false, error: `The SMTP Host field contains an email address. It should be a server name like smtp.gmail.com — use Quick fill above.` });
      return;
    }
    setTestingSmtp(true);
    setTestResult(null);
    const token = getAdminToken();
    const res = await fetch(`${API}/admin/notifications/test`, {
      method: "POST",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(smtp),
    });
    const data = await res.json();
    if (!data.ok && data.error) data.error = friendlySmtpError(data.error);
    setTestResult(data);
    setTestingSmtp(false);
  }

  async function handleDeleteSub(id: string) {
    const token = getAdminToken();
    await fetch(`${API}/admin/subscribers/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setSubscribers((prev) => prev.filter((s) => s._id !== id));
    toast({ title: "Subscriber removed" });
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Subject and message are required", variant: "destructive" });
      return;
    }
    setSending(true);
    setSendResult(null);
    const token = getAdminToken();
    const res = await fetch(`${API}/admin/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "apSHication/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subject, body }),
    });
    const data = await res.json();
    setSendResult({ sent: data.sent, failed: data.failed });
    setSending(false);
    if (data.ok) toast({ title: `Sent to ${data.sent} subscriber(s)` });
  }

  const tabs = [
    { id: "smtp", label: "SMTP Config", icon: Mail },
    { id: "subscribers", label: `Subscribers (${subscribers.length})`, icon: Users },
    { id: "broadcast", label: "Send Notification", icon: Send },
  ] as const;

  return (
    <AdminLayout title="Email & Notifications">
      <div className="max-w-2xl space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-sm">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-sm text-sm font-medium transition-colors ${
                activeTab === id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* SMTP Config */}
        {activeTab === "smtp" && (
          <div className="bg-white border border-border rounded-sm p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold">SMTP Configuration</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect your email provider (Gmail, Outlook, custom SMTP) to enable email notifications and contact form delivery.
              </p>
            </div>

            {/* Quick-fill provider buttons */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Quick fill for common providers:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
                  { label: "Outlook / Hotmail", host: "smtp.office365.com", port: 587, secure: false },
                  { label: "Yahoo Mail", host: "smtp.mail.yahoo.com", port: 587, secure: false },
                  { label: "Zoho Mail", host: "smtp.zoho.com", port: 587, secure: false },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setSmtp((s) => ({ ...s, host: p.host, port: p.port, secure: p.secure }))}
                    className="px-3 py-1 text-xs font-medium border border-border rounded-sm bg-muted hover:bg-border transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">SMTP Host</label>
                <input
                  className={`w-full border rounded-sm px-3 py-2 text-sm ${smtp.host.includes("@") ? "border-red-400 bg-red-50" : "border-border"}`}
                  value={smtp.host}
                  onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
                {smtp.host.includes("@") && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    ⚠ This looks like an email address — the Host should be a server name like <code className="bg-red-100 px-1 rounded">smtp.gmail.com</code>, not your email. Use "Quick fill" above.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Port</label>
                <input
                  type="number"
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                  value={smtp.port}
                  onChange={(e) => setSmtp((s) => ({ ...s, port: Number(e.target.value) }))}
                  placeholder="587"
                />
              </div>
              <div className="flex items-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <div
                    onClick={() => setSmtp((s) => ({ ...s, secure: !s.secure }))}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${smtp.secure ? "bg-primary" : "bg-muted border border-border"}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${smtp.secure ? "translate-x-4" : ""}`} />
                  </div>
                  <span className="text-sm">SSL/TLS (port 465)</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Username / Email</label>
                <input
                  type="email"
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                  value={smtp.user}
                  onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
                  placeholder="you@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Password / App Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full border border-border rounded-sm px-3 py-2 text-sm pr-9"
                    value={smtp.pass}
                    onChange={(e) => setSmtp((s) => ({ ...s, pass: e.target.value }))}
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From Name</label>
                <input
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                  value={smtp.fromName}
                  onChange={(e) => setSmtp((s) => ({ ...s, fromName: e.target.value }))}
                  placeholder="SamacharHUB"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From Email</label>
                <input
                  type="email"
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                  value={smtp.fromEmail}
                  onChange={(e) => setSmtp((s) => ({ ...s, fromEmail: e.target.value }))}
                  placeholder="news@samacharhub.com"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-sm p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">For Gmail:</p>
              <p>Enable 2FA → Generate an App Password → Use that as the password here. Host: <code>smtp.gmail.com</code>, Port: <code>587</code>, SSL off.</p>
            </div>

            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-sm text-sm ${testResult.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {testResult.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
                {testResult.ok ? "Connection successful! SMTP is working." : `Connection failed: ${testResult.error}`}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveSmtp}
                disabled={savingSmtp}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {savingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingSmtp ? "Saving…" : "Save SMTP Settings"}
              </button>
              <button
                onClick={handleTestSmtp}
                disabled={testingSmtp || !smtp.host}
                className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm text-sm font-medium hover:bg-muted disabled:opacity-60 transition-colors"
              >
                {testingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                {testingSmtp ? "Testing…" : "Test Connection"}
              </button>
            </div>
          </div>
        )}

        {/* Subscribers */}
        {activeTab === "subscribers" && (
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Email Subscribers</h2>
                <p className="text-xs text-muted-foreground mt-0.5">PeoSHe who signed up for email notifications from the website.</p>
              </div>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{subscribers.length} total</span>
            </div>

            {loadingSubs ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-sm" />)}</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No subscribers yet.</p>
                <p className="text-xs mt-1">PeoSHe can subscribe via the Contact Us page on your website.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <div key={sub._id} className="flex items-center justify-between py-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.email}</p>
                      {sub.name && <p className="text-xs text-muted-foreground">{sub.name}</p>}
                      <p className="text-xs text-muted-foreground/70">{new Date(sub.subscribedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSub(sub._id)}
                      className="p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                      title="Remove subscriber"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Broadcast */}
        {activeTab === "broadcast" && (
          <div className="bg-white border border-border rounded-sm p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Send Notification to All Subscribers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Compose a message that will be emailed to all {subscribers.length} subscriber(s).</p>
            </div>

            {subscribers.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-700">
                No subscribers yet. Notifications will be sent once peoSHe subscribe.
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <input
                className="w-full border border-border rounded-sm px-3 py-2 text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="New Edition Available — 9 May 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Message</label>
              <textarea
                className="w-full border border-border rounded-sm px-3 py-2 text-sm min-h-[140px] resize-y"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Today's edition is now available. Visit our website to read the latest news from across Vidarbha..."
              />
            </div>

            {sendResult && (
              <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Sent to <strong>{sendResult.sent}</strong> subscriber(s).
                {sendResult.failed > 0 && <span className="text-red-600"> {sendResult.failed} failed.</span>}
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={sending || !subject || !body}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Sending…" : `Send to ${subscribers.length} Subscriber(s)`}
            </button>
          </div>
        )}

        {/* Auto-notifications info */}
        <div className="bg-white border border-border rounded-sm p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Automatic Notifications</h2>
            <p className="text-xs text-muted-foreground mt-0.5">These fire automatically when events happen — no action needed. Requires SMTP to be configured.</p>
          </div>
          <div className="space-y-2">
            {[
              { event: "New Edition Published", to: "→ All Subscribers", desc: "Sent to all subscribers whenever a new edition is published.", color: "text-blue-500" },
              { event: "Breaking News Added", to: "→ All Subscribers", desc: "Sent to all subscribers when a new breaking news item is created.", color: "text-red-500" },
              { event: "Contact Form Submitted", to: "→ Admin Email", desc: "Forwarded to your contact email address (set in Footer & Site Settings).", color: "text-purSHe-500" },
              { event: "New Subscriber Joined", to: "→ Admin Email", desc: "You get an email when someone subscribes to your newsletter.", color: "text-green-500" },
              { event: "Maintenance Mode ON", to: "→ Admin Email", desc: "You get an alert when the site enters maintenance mode.", color: "text-amber-500" },
              { event: "Maintenance Mode OFF", to: "→ Admin Email", desc: "You get a confirmation when the site is back online.", color: "text-green-500" },
            ].map(({ event, to, desc, color }) => (
              <div key={event} className="flex items-start gap-3 p-3 bg-muted/30 rounded-sm border border-border">
                <CheckCircle className={`h-4 w-4 ${color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{event}</p>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
