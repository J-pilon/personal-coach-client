# 🧭 Design Brief – AI SMART To-Do List App (Gradient UI Style)

## 🛠️ Tech Stack

**Frontend:**  
- React Native (Expo)  
  - Fast dev cycles  
  - Cross-platform (iOS + Android)  
  - Native-like performance  

**Backend:**  
- Supabase  
  - Auth  
  - PostgreSQL DB  
  - Edge functions for logic and caching  

**AI Engine:**  
- OpenAI GPT-4o API  
  - Langchain-lite for context injection and compression  
  - Token budgeting middleware to keep costs low  
  - Custom memory layer to track user’s SMART goals & task history  

---

## 🎯 Mission of the App

> **"Clarity without chaos. Turn intention into action."**

This app helps thoughtful, high-performing individuals turn their goals into focused daily action using AI assistance and minimal interface friction.  

The mission is to reduce decision fatigue and increase execution through intelligent daily planning grounded in SMART goals.

---

## 🎨 Tone and Feel (Updated for UI Style)

- **Futuristic and Elegant** – clean design with layered gradients
- **Minimalist and modern** – intentional whitespace, no clutter
- **Premium, digital-native** – combines the feel of fintech and productivity apps

### UI Style:
- **Gradient Backgrounds**: Smooth radial or vertical gradients using deep blue to cyan or teal
- **Rounded Corners**: All containers, buttons, and inputs should have medium-to-large border radius
- **Soft Shadows and Elevation**: Use elevation for layering, cards should hover gently
- **Icons**: Use outline-style icons with a digital aesthetic (e.g. Feather, Ionicons)
- **Visual Hierarchy**: Large headers, small subtext, and clear spacing between elements
- **Bottom Navigation Bar**: Consistent iconography with highlight for selected state

---

## 🗣️ Voice

- **Calm, Confident, and Helpful.**  
- Always speak like a supportive mentor or intelligent assistant:
  - Short prompts
  - Clarity in language
  - Encourage without pressure

> Examples:  
> - “Let’s set a focus for the week.”  
> - “Here’s what matters today.”  
> - “Want help refining that goal?”

---

## 🎨 Brand Colors (Updated for Gradient UI)

| Color Name          | Hex Code  | Use Case                                  |
|---------------------|-----------|-------------------------------------------|
| Deep Navy           | `#021A40` | Background base                           |
| Indigo Gradient Top | `#274B8E` | Gradient start (header, hero cards)       |
| Electric Blue       | `#33CFFF` | Gradient end (CTA, primary buttons)       |
| Light Cyan          | `#E6FAFF` | Secondary highlights, icons, cards        |
| Soft White Text     | `#F1F5F9` | Text on dark backgrounds                  |
| Slate Grey          | `#708090` | Subtext and muted UI labels               |

*Use gradients for cards and backgrounds, combine deep blue with electric accents for visual depth. Glow effects should be subtle and only used for CTAs.*

---

## 📱 Components to Match the Design

- **Hero Card**: Intro callout with CTA ("Start your first SMART goal")
- **Summary Widget**: Daily Focus area showing 1–3 tasks with status icons
- **SMART Goal Tiles**: Use card-style layout for each goal with edit/access icons
- **Bottom Tab Bar**: Floating icons with gradient fill and active state highlighting
- **Modals**: Semi-transparent background with blurred effect; use for quick adds

---

## 📐 Typography

| Use Case     | Font Weight | Size   | Color         |
|--------------|-------------|--------|---------------|
| Headings     | SemiBold    | 24–32  | `#F1F5F9`     |
| Body Text    | Regular     | 16     | `#E6FAFF`     |
| Subtext      | Light       | 14     | `#708090`     |

Use a modern sans-serif font like **Inter**, **Manrope**, or **Poppins**.

---

