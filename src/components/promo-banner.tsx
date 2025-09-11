import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const promoImage = PlaceHolderImages.find(p => p.id === 'promo-banner');

  return (
    <section className="relative h-[400px] w-full md:h-[500px]">
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
      <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-foreground">
        <div className="max-w-2xl pb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl md:text-6xl">
            Seasonal Sake Tasting
          </h1>
          <p className="mt-4 text-lg text-gray-200 drop-shadow-sm md:text-xl">
            Discover our curated selection of premium sake, perfectly paired with our chef's special creations.
          </p>
          <Button size="lg" className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
            View Pairings
          </Button>
        </div>
      </div>
    </section>
  );
}
