import './globals.css'

export const metadata = {
  title: 'Fabula - Story Adventures for Language Learners',
  description: 'Learn languages through fun, interactive AI-generated stories!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
