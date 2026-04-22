import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// Marketing showcase: a scroll-tilt reveal of the Fixpass hammer —
// silver head, royal-blue handle, Fixpass house+F mark stamped on the
// grip. Sits between the brand pillars and the service inventory:
// "here's the craft behind the membership."

export function HammerScrollShowcase() {
  return (
    <section className="relative">
      <ContainerScroll
        titleComponent={
          <>
            <span className="eyebrow">The craft behind the membership</span>
            <h2 className="display-hero mt-5 text-4xl text-ink sm:text-5xl md:text-[5rem]">
              Built around the work,
              <br />
              <span className="text-royal">not the checkout.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted md:text-lg">
              Not a marketplace of strangers. One vetted team, one set of
              tools, one standard of care — kept sharp for every member&rsquo;s
              home.
            </p>
          </>
        }
      >
        {/* -m-* pulls the image past the Card's inner p-6 so it goes
            edge-to-edge with the bezel. The render's navy background is
            close to surface-dark, so the seam disappears. object-cover
            on a landscape frame trims the excess blue margin above/below
            the hammer without touching the hammer itself. */}
        <div className="relative -m-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] md:-m-6 md:h-[calc(100%+3rem)] md:w-[calc(100%+3rem)]">
          <Image
            src="/brand/fixpass-hammer.png"
            alt="Fixpass hammer — silver head and royal-blue handle stamped with the Fixpass mark"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover object-center"
          />
        </div>
      </ContainerScroll>
    </section>
  );
}
