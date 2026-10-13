import { useState, useEffect } from "react";
import { useLang } from "@/lib/lang";
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, Bell } from "lucide-react";

const API = "/api";

interface ContactSettings {
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressMr: string;
  contactAddressHi?: string;
  socialLinks: { platform: string; url: string; icon: string }[];
}

function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setSettings(d); })
      .catch(() => {});
  }, []);
  return settings;
}

export default function ContactPage() {
  const { lang, t } = useLang();
  const settings = useContactSettings();

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [subEmail, setSubEmail] = useState("");
  const [subName, setSubName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [unsubscribeToken, setUnsubscribeToken] = useState<string | null>(null);

  function setField(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch(`${API}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } else {
      setError(
        t(
          "Failed to send message. Please try again.",
          "संदेश पाठवण्यात अयशस्वी. पुन्हा प्रयत्न करा.",
          "संदेश भेजने में विफल। कृपया पुन: प्रयास करें।",
        ),
      );
    }
    setSubmitting(false);
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail) return;
    setSubscribing(true);
    try {
      const res = await fetch(`${API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail, name: subName }),
      });
      if (res.ok) {
        const data = await res.json();
        setUnsubscribeToken(data.unsubscribeToken || null);
        setSubscribed(true);
      }
    } catch { /* ignore */ }
    setSubscribing(false);
  }

  const address = t(
    settings?.contactAddress || "",
    settings?.contactAddressMr || settings?.contactAddress || "",
    settings?.contactAddressHi || settings?.contactAddressMr || settings?.contactAddress || "",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-black text-foreground">
          {t("Contact Us", "संपर्क करा", "संपर्क करें")}
        </h1>
        <div className="h-1 w-16 bg-primary mt-2 rounded-full" />
        <p className="text-muted-foreground text-sm mt-3 max-w-xl">
          {t(
            "Get in touch with us. We'll get back to you as soon as possible.",
            "आम्हाला संपर्क करा. आम्ही लवकरात लवकर तुमच्याशी संपर्क साधू.",
            "हमसे संपर्क करें। हम जल्द ही आपसे संपर्क करेंगे।",
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left: Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-primary text-primary-foreground rounded-sm p-6 space-y-5">
            <h2 className="font-serif text-lg font-bold">
              {t("Contact Information", "संपर्क माहिती", "संपर्क जानकारी")}
            </h2>

            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/60 mb-0.5">{t("Email", "ईमेल", "ईमेल")}</p>
                  <p className="text-sm font-medium break-all">{settings.contactEmail}</p>
                </div>
              </a>
            )}

            {settings?.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="flex items-start gap-3 group">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/60 mb-0.5">{t("Phone", "फोन", "फ़ोन")}</p>
                  <p className="text-sm font-medium">{settings.contactPhone}</p>
                </div>
              </a>
            )}

            {address && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/60 mb-0.5">{t("Address", "पत्ता", "पता")}</p>
                  <p className="text-sm font-medium">{address}</p>
                </div>
              </div>
            )}

            {!settings?.contactEmail && !settings?.contactPhone && !address && (
              <p className="text-sm text-primary-foreground/60">
                {t(
                  "Contact details coming soon.",
                  "संपर्क माहिती लवकरच जोडली जाईल.",
                  "संपर्क जानकारी जल्द ही जोड़ी जाएगी।",
                )}
              </p>
            )}
          </div>

          {/* Newsletter subscribe */}
          <div className="bg-white border border-border rounded-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">
                {t("Newsletter Subscription", "वृत्तपत्र सदस्यता", "समाचार पत्र सदस्यता")}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {t(
                "Get notified by email whenever a new edition is published.",
                "नवीन आवृत्ती प्रकाशित होताच ईमेल प्राप्त करा.",
                "नया संस्करण प्रकाशित होते ही ईमेल प्राप्त करें।",
              )}
            </p>

            {subscribed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {t("Subscribed successfully!", "यशस्वीरित्या सदस्यता घेतली!", "सफलतापूर्वक सदस्यता ली गई!")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "You'll receive an email whenever a new edition is published.",
                    "नवीन आवृत्ती प्रकाशित होताच तुम्हाला ईमेल मिळेल.",
                    "नया संस्करण प्रकाशित होने पर आपको ईमेल प्राप्त होगा।",
                  )}
                </p>
                {unsubscribeToken && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "Want to unsubscribe later?",
                      "सदस्यता रद्द करायची असल्यास",
                      "बाद में सदस्यता समाप्त करना चाहते हैं?",
                    )}{" "}
                    <a
                      href={`/api/unsubscribe?token=${unsubscribeToken}`}
                      className="underline hover:text-foreground transition-colors"
                    >
                      {t("Click here to unsubscribe", "येथे क्लिक करा", "सदस्यता समाप्त करने के लिए यहां क्लिक करें")}
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder={t("Your name (optional)", "नाव (ऐच्छिक)", "आपका नाम (वैकल्पिक)")}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder={t("Your email address", "तुमचा ईमेल", "आपका ईमेल पता")}
                  className="w-full border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                  {subscribing
                    ? t("Subscribing…", "सदस्यता घेत आहे…", "सदस्यता ली जा रही है…")
                    : t("Subscribe", "सदस्यता घ्या", "सदस्यता लें")}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-sm p-6">
            <h2 className="font-serif text-lg font-bold mb-5">
              {t("Send Us a Message", "संदेश पाठवा", "हमें संदेश भेजें")}
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {t("Message Sent!", "संदेश पाठवला!", "संदेश भेज दिया गया!")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t(
                    "Your message has been received. We'll get back to you shortly.",
                    "आपला संदेश आम्हाला मिळाला आहे. आम्ही लवकरच तुमच्याशी संपर्क साधू.",
                    "आपका संदेश प्राप्त हो गया है। हम जल्द ही आपसे संपर्क करेंगे।",
                  )}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-sm text-primary hover:underline"
                >
                  {t("Send another message", "आणखी एक संदेश पाठवा", "दूसरा संदेश भेजें")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("Full Name *", "नाव *", "पूरा नाम *")}
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder={t("Your full name", "तुमचे नाव", "आपका पूरा नाम")}
                      className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {t("Email Address *", "ईमेल *", "ईमेल पता *")}
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {t("Phone Number (optional)", "फोन (ऐच्छिक)", "फ़ोन नंबर (वैकल्पिक)")}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    {t("Message *", "संदेश *", "संदेश *")}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder={t("Write your message here…", "तुमचा संदेश येथे लिहा…", "अपना संदेश यहाँ लिखें…")}
                    className="w-full border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-y"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting
                    ? t("Sending…", "पाठवत आहे…", "भेजा जा रहा है…")
                    : t("Send Message", "संदेश पाठवा", "संदेश भेजें")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
