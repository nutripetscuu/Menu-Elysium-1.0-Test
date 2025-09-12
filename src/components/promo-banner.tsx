import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function PromoBanner() {
  const promoImage = PlaceHolderImages.find(p => p.id === 'promo-banner');

  return (
    <section className="relative h-[200px] w-full md:h-[250px]">
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
      <div className="absolute inset-0 flex flex-col items-start justify-center p-4 text-left text-foreground md:p-8">
        <div className="max-w-2xl">
          <h1 className="text-xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-2xl md:text-3xl">
            Sake
          </h1>
          <p className="mt-1 text-xs text-gray-200 drop-shadow-sm md:text-sm">
            Descubre
          </p>
        </div>
      </div>
    </section>
  );
}
