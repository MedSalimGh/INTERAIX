<div align="center">
  <br />
    <img src="public/project banner.png" alt="Project Banner" width="100%">
  <br />

  <h1 align="center">INTERVAIX</h1>
  <p align="center">
    <b>Master Your Interviews with AI Voice Agents</b>
  </p>

  <div align="center">
    <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Vapi-5dfeca?style=for-the-badge&logoColor=white" alt="Vapi" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase" />
    <img src="https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logoColor=white" alt="Groq" />
  </div>
</div>

<br />

## 🤖 Introduction

**INTERVAIX** (formerly Prepwise) is a cutting-edge job interview preparation platform designed to simulate real-world interview scenarios. Built with **Next.js** and powered by **Vapi AI** voice agents and **Groq's Llama 3** model, it offers an immersive experience where users can practice speaking with an AI interviewer.

Whether you are preparing for a technical role or refining your behavioral answers, IntervAIX provides instant, structured feedback to help you improve.

## 🔋 Key Features

- **🎙️ AI Voice Interviewer**: Real-time voice interaction using Vapi AI for a natural conversation flow.
- **⚡ Ultra-Fast Generation**: Powered by **Groq (Llama 3)** for near-instant question generation and feedback.
- **📝 Comprehensive Feedback**: Get detailed scoring on Communication, Technical Knowledge, and more.
- **🔐 Secure Authentication**: Robust user management with Firebase Auth.
- **🎨 Modern UI**: A beautiful, responsive interface built with Tailwind CSS and shadcn/ui.
- **📊 Dashboard**: Track your progress and review past interview transcripts.

## ⚙️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Shadcn/UI |
| **Backend** | Next.js API Routes, Firebase Admin SDK |
| **AI & Voice** | Vapi AI (Voice), Groq SDK (LLM), Vercel AI SDK |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Validation** | Zod, React Hook Form |

## 🤸 Quick Start

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MedSalimGh/INTERVAIX.git
   cd interview-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   # Vapi AI
   NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
   NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id

   # Groq (LLM)
   GROQ_API_KEY=your_groq_api_key

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   
   # App Config
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) to start practicing!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/YOUR_USERNAME">BLACK STAR</a>
</div>