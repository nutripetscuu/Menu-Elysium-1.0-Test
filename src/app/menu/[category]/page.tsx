"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params['category'] as string;

  useEffect(() => {
    // Redirect to main page with hash for the category
    router.replace(`/#${categoryId}`);
  }, [categoryId, router]);

  // Return nothing as we're redirecting
  return null;
}