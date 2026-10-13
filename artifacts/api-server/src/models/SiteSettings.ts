import mongoose, { Schema, Document } from "mongoose";

export interface IQuickLink {
  label: string;
  labelMr: string;
  labelHi?: string;
  url: string;
  order: number;
}

export interface ISocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ISiteSettings extends Document {
  siteDescription: string;
  siteDescriptionMr: string;
  siteDescriptionHi?: string;
  quickLinks: IQuickLink[];
  socialLinks: ISocialLink[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactAddressMr: string;
  contactAddressHi?: string;
  aboutContent: string;
  aboutContentMr: string;
  aboutContentHi?: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceMessageMr: string;
  maintenanceMessageHi?: string;
  defaultLanguage: "en" | "mr" | "hi";
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
  };
  poweredByText: string;
  poweredByUrl: string;
  hotspotUIConfig?: any;
}

const QuickLinkSchema = new Schema<IQuickLink>(
  {
    label: { type: String, required: true },
    labelMr: { type: String, default: "" },
    labelHi: { type: String, default: "" },
    url: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: "" },
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema<ISiteSettings>({
  siteDescription: { type: String, default: "Vidarbha's trusted regional e-newspaper. Covering politics, sports, business, and more from the heart of Maharashtra." },
  siteDescriptionMr: { type: String, default: "विदर्भाचे विश्वासू प्रादेशिक वृत्तपत्र. महाराष्ट्राच्या हृदयातून राजकारण, क्रीडा, व्यापार आणि अधिक." },
  siteDescriptionHi: { type: String, default: "महाराष्ट्र का विश्वसनीय क्षेत्रीय ई-समाचार पत्र। राजनीति, खेल, व्यापार और बहुत कुछ।" },
  quickLinks: {
    type: [QuickLinkSchema], default: [
      { label: "About Us", labelMr: "आमच्या विषयी", labelHi: "हमारे बारे में", url: "/about", order: 0 },
      { label: "Contact Us", labelMr: "संपर्क", labelHi: "संपर्क", url: "/contact", order: 1 },
      { label: "Politics", labelMr: "राजकारण", labelHi: "राजनीति", url: "/category/politics", order: 2 },
      { label: "Sports", labelMr: "क्रीडा", labelHi: "खेल", url: "/category/sports", order: 3 },
    ]
  },
  socialLinks: {
    type: [SocialLinkSchema], default: [
      { platform: "Facebook", url: "https://facebook.com", icon: "facebook" },
      { platform: "WhatsApp", url: "https://wa.me/", icon: "whatsapp" },
      { platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
      { platform: "Telegram", url: "https://telegram.org", icon: "telegram" },
    ]
  },
  contactEmail: { type: String, default: "" },
  contactPhone: { type: String, default: "" },
  contactAddress: { type: String, default: "Maharashtra, India" },
  contactAddressMr: { type: String, default: "महाराष्ट्र, भारत" },
  contactAddressHi: { type: String, default: "महाराष्ट्र, भारत" },
  aboutContent: { type: String, default: "SamacharHUB is a leading regional e-newspaper committed to providing accurate and timely news." },
  aboutContentMr: { type: String, default: "समाचार हब हे एक अग्रगण्य प्रादेशिक ई-वृत्तपत्र आहे जे अचूक आणि वेळेवर बातम्या देण्यासाठी वचनबद्ध आहे." },
  aboutContentHi: { type: String, default: "समाचार हब एक अग्रणी क्षेत्रीय ई-समाचार पत्र है जो सटीक और समय पर समाचार प्रदान करने के लिए प्रतिबद्ध है।" },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: "We are currently under maintenance. Please check back soon." },
  maintenanceMessageMr: { type: String, default: "आम्ही सध्या देखभाल करत आहोत. कृपया लवकरच परत या." },
  maintenanceMessageHi: { type: String, default: "हम वर्तमान में रखरखाव में हैं। कृपया शीघ्र ही पुनः देखें।" },
  defaultLanguage: { type: String, enum: ["en", "mr", "hi"], default: "en" },
  smtpConfig: {
    type: new Schema({
      host: { type: String, default: "" },
      port: { type: Number, default: 587 },
      secure: { type: Boolean, default: false },
      user: { type: String, default: "" },
      pass: { type: String, default: "" },
      fromName: { type: String, default: "SamacharHUB" },
      fromEmail: { type: String, default: "" },
    }, { _id: false }),
    default: {},
  },
  poweredByText: { type: String, default: "Deep Kamble & Gufran Khan" },
  poweredByUrl: { type: String, default: "http://localhost:3000" },
  hotspotUIConfig: { type: Schema.Types.Mixed, default: null },
});

export const SiteSettings = mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
