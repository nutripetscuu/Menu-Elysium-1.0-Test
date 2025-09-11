import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const promoImage = PlaceHolderImages.find(p => p.id === 'promo-banner');

  return (
    <section className="relative h-[100px] w-full md:h-[120px]">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-foreground">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl md:text-4xl">
            Degustación de Sake de Temporada
          </h1>
          <p className="mt-2 text-sm text-gray-200 drop-shadow-sm md:text-base">
            Descubre nuestra selección curada de sake premium.
          </p>
        </div>
      </div>
    </section>
  );
}
