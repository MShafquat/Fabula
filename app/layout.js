import './globals.css'

export const metadata = {
  title: 'Fabula - Tales for Learning',
  description: 'Learn languages through immersive stories.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
