"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestDbPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const test = async () => {
      try {
        console.log('Testing direct Supabase connection...');

        // Test basic connection first
        const { data, error } = await supabase
          .from('Header Images')
          .select('*')
          .limit(5);

        console.log('Direct Supabase response:', { data, error });

        if (error) {
          setError(`Supabase Error: ${error.message || 'Unknown error'}`);
          setResult({ error, data: null });
        } else {
          setResult({ data, error: null, success: true });
          setError(null);
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setResult({ error: err, data: null });
      } finally {
        setLoading(false);
      }
    };

    test();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Database Connection...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">🔍 Supabase Connection Test</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Raw Response:</h2>
        <pre className="text-sm overflow-auto bg-white p-2 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      {result?.data && result.data.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">✅ {result.data.length} Images Found:</h2>
          <div className="grid gap-4">
            {result.data.map((img: any, i: number) => (
              <div key={i} className="border p-4 rounded bg-white">
                <p><strong>ID:</strong> {img.id}</p>
                <p><strong>Created:</strong> {img.created_at}</p>
                <p><strong>URL:</strong>
                  <a href={img["Image url"]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    {img["Image url"]}
                  </a>
                </p>
                <div className="mt-2">
                  <img
                    src={img["Image url"]}
                    alt={`Image ${i + 1}`}
                    className="max-w-xs h-auto rounded"
                    onError={(e) => {
                      console.log('Image load error:', e);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.data && result.data.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          ⚠️ No images found in the Header Images table.
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold">🛠️ Environment Check:</h3>
        <p><strong>Full Supabase URL:</strong>
          <code className="bg-white px-2 py-1 rounded text-sm ml-2">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}
          </code>
        </p>
        <p><strong>Has Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
        <p><strong>Anon Key (first 20 chars):</strong>
          <code className="bg-white px-2 py-1 rounded text-sm ml-2">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </code>
        </p>
      </div>

      <div className="mt-4 p-4 bg-red-50 rounded">
        <h3 className="font-semibold">❌ Diagnosis:</h3>
        <p className="text-red-700">
          <strong>NetworkError</strong> usually means:
        </p>
        <ul className="list-disc list-inside text-red-700 mt-2">
          <li>The Supabase URL is incorrect or misspelled</li>
          <li>Your Supabase project is paused or deleted</li>
          <li>Network connectivity issues</li>
          <li>CORS configuration problems</li>
        </ul>
        <div className="mt-3 p-3 bg-yellow-100 rounded">
          <p className="text-sm">
            <strong>📋 Please check:</strong><br/>
            1. Go to Supabase Dashboard → Settings → API<br/>
            2. Copy the exact &ldquo;Project URL&rdquo;<br/>
            3. Make sure your project is not paused<br/>
            4. Verify the URL format: https://[project-id].supabase.co
          </p>
        </div>
      </div>
    </div>
  );
}