import Link from 'next/link';
import Dashboard from './dashboard';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <Link href="/dashboard">Go to Dashboard</Link>
      <Dashboard />
    </div>
  );
}