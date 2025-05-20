// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Welcome to Image Database</h1>
      <div className="space-y-4">
        <p>This is the home page of your image database application.</p>
        <div>
          <a 
            href="/api/auth/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}