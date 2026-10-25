import Image from "next/image";
import type { SiteImage as ImageData } from "@/data/site";

export function SiteImage({ image, priority = false, className = "", sizes = "(max-width: 760px) 50vw, 33vw" }: { image: ImageData; priority?: boolean; className?: string; sizes?: string }) {
  return <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes={sizes} priority={priority} className={className} />;
}
