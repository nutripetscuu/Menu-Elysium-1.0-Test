import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CategoryNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Categoría no encontrada
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            La categoría que buscas no existe o no está disponible en este momento.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              Volver al menú principal
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/menu/sushi">
              Ver Sushi
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}