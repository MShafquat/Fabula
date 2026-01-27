# 📖 Fabula - Tales for Learning

Fabula is a magical, AI-powered language learning application that generates personalized short stories to help you master new languages through immersive storytelling.

![Fabula Preview](https://raw.githubusercontent.com/MShafquat/Fabula/main/public/preview.png) *(Note: Add your own preview image here)*

## ✨ Features

### 🎙️ Immersive Audio Experience
- **Narration**: Listen to full stories with high-quality Text-to-Speech voices.
- **Interactive Audio**: Click on any lexicon word or word lookup popup to hear native pronunciation.
- **Smart Pacing**: Audio is played at a comfortable 0.9x speed for learners.
- **Play/Pause Controls**: Easily pause and resume narration as you follow along.

### 🌍 Intelligent Comprehension
- **Dynamic Story Generation**: Stories tailored to your target language, difficulty level, and chosen topic.
- **Full Story Translation**: Toggle an English translation of the entire story to verify your understanding.
- **Title Meaning**: Instant English translations for story titles.
- **Standard Phonetics**: Word pronunciations use native phonetic systems (like IPA).

### 📚 Interactive Learning Tools
- **Double-Click Dictionary**: Double-click any word in the story to see its definition, part of speech, and an example sentence.
- **Visual Lexicon**: A curated list of key vocabulary from each story with pronunciations and examples.
- **Reflective Quizzes**: Test your comprehension with interactive exercises at the end of every tale.

### 🎨 Premium Aesthetic
- **Bookish Design**: A refined, parchment-themed interface designed for focused reading.
- **Rich Interaction**: Smooth transitions, micro-animations, and a responsive layout.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Vanilla CSS (Premium focused)
- **AI Engine**: OpenAI (GPT-4o for stories, DALL-E 3 for illustrations)
- **Audio**: Web Speech API
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MShafquat/Fabula.git
   cd Fabula
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 License

This project is licensed under the MIT License.

---
*Created with ❤️ for language lovers.*
