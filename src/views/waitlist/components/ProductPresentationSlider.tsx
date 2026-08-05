"use client";

import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import {
  CARD,
  INK,
  INVERSE_FOREGROUND,
  OXBLOOD,
  PAPER,
} from "@/shared/config/design-tokens";
import { Heading } from "@/shared/ui/Heading";
import { useReducedMotion } from "motion/react";

const presentationSlides = [
  {
    label: "Manuscript",
    src: "/images/slide-manuscript.webp",
  },
  {
    label: "Readers",
    src: "/images/slide-reader.webp",
  },
  {
    label: "Feedback",
    src: "/images/slide-feedback.webp",
  },
  {
    label: "Surveys",
    src: "/images/slide-survey.webp",
  },
] as const;

export function ProductPresentationSlider() {
  const reduceMotion = useReducedMotion();
  const [slider, setSlider] = useState<SwiperInstance | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="hidden border-b px-6 py-10 md:block md:px-12 md:py-14" style={{ borderColor: "hsl(var(--ink) / 0.1)", background: CARD }} aria-label="BetaManuscript product presentation">
      <div className="mx-auto max-w-6xl">
        <Heading level={2} size="page" className="mb-8 text-balance">
          Everything you need for a structured beta round.
        </Heading>
        <div className="relative overflow-hidden border paper-shadow" style={{ borderColor: "hsl(var(--ink) / 0.16)", background: PAPER }}>
          <Swiper
            modules={[A11y, Autoplay]}
            onSwiper={setSlider}
            onSlideChange={(instance) => setActiveSlide(instance.realIndex)}
            loop
            autoplay={reduceMotion ? false : { delay: 4800, disableOnInteraction: false, pauseOnMouseEnter: true }}
            a11y={{
              containerMessage: "BetaManuscript product presentation",
              slideLabelMessage: "Slide {{index}} of {{slidesLength}}",
            }}
          >
            {presentationSlides.map((slide, index) => (
              <SwiperSlide key={slide.label}>
                <div className="relative aspect-[143/65] min-h-52 bg-[#EDE8DC]">
                  <Image
                    alt={`BetaManuscript ${slide.label.toLowerCase()} workspace`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1200px) 1152px, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
                    src={slide.src}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-3 sm:px-5 sm:pb-5">
            <div className="flex max-w-full gap-2 overflow-x-auto bg-[hsl(var(--inverse-background))] p-4">
              {presentationSlides.map((slide, index) => {
                const isActive = index === activeSlide;

                return (
                  <button
                    key={slide.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => slider?.slideToLoop(index)}
                    className="inline-flex min-h-10 shrink-0 items-center border px-3 text-left text-[11px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
                    style={{
                      borderColor: isActive ? OXBLOOD : "hsl(var(--ink) / 0.18)",
                      background: isActive ? OXBLOOD : "hsl(var(--paper) / 0.94)",
                      color: isActive ? INVERSE_FOREGROUND : INK,
                    }}
                  >
                    <span>{slide.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
