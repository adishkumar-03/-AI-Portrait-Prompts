# ⚡ PromptPersona — AI Portrait Prompt Showcase & Personalizer

**PromptPersona** is a modern, responsive web application where you can showcase curated AI-generated portrait prompts and images, allowing visitors to easily copy prompts and personalize them to create stunning AI photos of themselves.

Built with **Vanilla HTML5, modern CSS3, and JavaScript (ES Modules)**, with turnkey **Supabase** cloud database & storage integration and a zero-setup local demo mode.

---

## ✨ Key Features

- **🎨 Curated Portrait Gallery**:
  - Filter by category: *Professional Headshots, Cinematic & Moody, Cyberpunk & Sci-Fi, Vintage & Film, High Fashion Editorial, Fantasy & Ethereal, Studio Minimalist*.
  - Filter by AI model: *Midjourney v6.1, Flux.1 Dev / Schnell, Stable Diffusion XL, DALL-E 3*.
  - Filter by aspect ratio: *4:5, 1:1, 9:16, 16:9*.
  - Live instant search with keyboard shortcut `/` support.
  - Sort by Most Popular (copy count), Newest, or Title.
  - Personal Bookmarks / Favorites system saved in `localStorage`.

- **📋 1-Click Copy & Copy Analytics**:
  - Single-click prompt copy with instant visual checkmark feedback and floating toast alerts.
  - Tracks and increments copy counts in real-time so visitors can see trending prompts.

- **🎛️ Interactive Prompt Personalizer**:
  - Automatically parses bracketed prompt variables like `[a 28-year-old person with sharp features]`, `[wearing black oversized turtleneck]`, `[warm sunset golden hour sunlight]`.
  - Visitors can type their own features, hair color, and clothing into live form fields.
  - Real-time live output prompt preview ready to copy.

- **📸 "Create Photos of Yourself" Guides**:
  - Built-in guide tabs for:
    - **Midjourney v6**: Using `--cref <your_image_url>` and `--cw 25` for consistent facial identity.
    - **Flux.1**: Using PuLID and InstantID identity conditioning.
    - **Stable Diffusion XL**: Using ReActor / InsightFace and face restoration models.

- **🔒 Dedicated Admin Studio (`admin.html`)**:
  - Secure login gate (Supabase Auth or quick demo passcode `admin123`).
  - Form to publish new prompts with live placeholder taggers (`+ [subject]`, `+ [clothing]`, `+ [lighting]`).
  - Drag-and-drop image uploader that uploads directly to Supabase Storage bucket `prompt-images` or accepts direct image URLs.
  - Management table to view, edit, or delete existing prompts.
  - Live analytics: Total prompts, total copies, top category.

---

## 🚀 Quick Start (Running Locally)

### Option 1: Double-Click Batch File (Windows)
Double-click `start_server.bat` in the project root folder. It will start a local HTTP server and automatically open `http://localhost:8080` in your web browser.

### Option 2: PowerShell
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

### Option 3: Open in Any Browser
You can also directly double-click `index.html` to open it in Chrome, Edge, or Firefox.

> **Note on Initial Launch:** Out of the box, the site runs in **Demo Mode** with 8 curated sample portrait prompts and full interactivity. You can test publishing and editing prompts immediately!

---

## 🗄️ Supabase Cloud Database & Storage Setup

To persist your prompts, track live copy metrics, and host image uploads in your own Supabase project:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In your Supabase dashboard, navigate to **Project Settings > API**.
3. Copy your **Project URL** and **anon public key**.

### Step 2: Run the SQL Schema
1. In the Supabase dashboard, click on **SQL Editor** in the left sidebar.
2. Open the file [`sql/supabase_schema.sql`](sql/supabase_schema.sql) from this project.
3. Paste its contents into the Supabase SQL editor and click **RUN**.
   - This creates the `prompts` table with search indices.
   - Configures the `prompt-images` storage bucket with public access.
   - Sets up Row Level Security (RLS) policies allowing public viewing and copy increments, while restricting inserts/edits/deletions to authenticated admins.

### Step 3: Connect in the Website UI
1. Open the website and click the **Demo Mode / Connection Badge** in the top navigation, or go to the **Admin Studio > Supabase Database Settings** tab.
2. Paste your **Project URL** and **anon key**, then click **Save & Connect**.
3. The site is now live connected to your Supabase PostgreSQL database and Storage bucket!

*(Optional)* You can also hardcode these credentials inside [`js/config.js`](js/config.js) if you prefer.

---

## 📁 Project Structure

```
ai prompt website/
├── index.html                 # Main public portal & gallery + modals + personalizer
├── admin.html                 # Dedicated admin studio for uploading & managing prompts
├── server.ps1                 # Zero-dependency PowerShell local web server
├── start_server.bat           # One-click Windows launcher
├── README.md                  # Documentation and setup instructions
├── css/
│   ├── style.css              # Main design system, glassmorphism, responsive grid, modals
│   └── admin.css              # Admin dashboard, forms, dropzone, tables
├── js/
│   ├── config.js              # Supabase configuration & localStorage persistence
│   ├── default-prompts.js     # Curated initial portrait prompts dataset
│   ├── supabase-client.js     # Supabase client wrapper & local fallback layer
│   ├── app.js                 # Gallery, search, filter, copy, toast & personalizer logic
│   └── admin.js               # Admin authentication, prompt publisher, editor & analytics
└── sql/
    └── supabase_schema.sql    # Complete SQL schema for tables, storage bucket & RLS
```

---

## 💡 How to Write Prompts for Best Personalization

When you add new prompts in the Admin Studio, wrap parts that visitors can personalize inside square brackets `[...]`. For example:

```text
A cinematic medium portrait of [a 28-year-old person with natural smile and wavy dark hair], 
[wearing an oversized camel wool trench coat], standing in [rainy neon Tokyo street], 
warm tungsten rim light, shot on 35mm anamorphic lens, f/1.4 --ar 4:5 --v 6.1 --style raw
```

The website automatically turns `[a 28-year-old person...]`, `[wearing an oversized...]`, and `[rainy neon...]` into interactive text inputs in the modal so visitors can customize their age, hair, clothing, and background with a few keystrokes before copying!
