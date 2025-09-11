import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const promoImage = PlaceHolderImages.find(p => p.id === 'promo-banner');

  return (
    <section className="relative h-[150px] w-full md:h-[200px]">
      {promoImage && (
        <Image
          src={promoImage.imageUrl}
          alt={promoImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={promoImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-foreground">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
            Degustación de Sake de Temporada
          </h1>
          <p className="mt-4 text-lg text-gray-200 drop-shadow-sm md:text-xl">
            Descubre nuestra selección curada de sake premium, maridado perfectamente con las creaciones especiales de nuestro chef.
          </p>
          <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            Ver Maridajes
          </Button>
        </div>
      </div>
    </section>
  );
}
