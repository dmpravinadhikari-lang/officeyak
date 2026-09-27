import { Splash } from "@/components/motion/BellMotion";

/** The same wait, on the public side. */
export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <Splash caption="One moment" />
    </main>
  );
}
