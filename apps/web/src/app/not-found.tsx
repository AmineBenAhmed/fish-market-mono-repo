import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Go Home
      </Link>
    </div>
  );
}
