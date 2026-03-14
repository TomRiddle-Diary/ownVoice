import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-white via-light-yellow to-light-yellow text-foreground md:h-dvh">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-12 top-24 h-48 w-48 rounded-full bg-secondary/25 blur-3xl" />
        <div className="absolute -right-12 top-36 h-36 w-36 rotate-12 rounded-xl bg-primary/35 blur-2xl" />
        <div className="absolute left-[15%] top-[42%] h-0 w-0 rotate-6 border-l-52 border-r-52 border-b-88 border-l-transparent border-r-transparent border-b-secondary/25 blur-xl" />
        <div className="absolute right-[18%] bottom-32 h-32 w-32 rounded-full bg-primary/30 blur-2xl" />
        <div className="absolute left-[8%] bottom-20 h-24 w-24 -rotate-6 rounded-md bg-secondary/30 blur-2xl" />
        <div className="absolute right-[8%] bottom-8 h-0 w-0 -rotate-12 border-l-44 border-r-44 border-b-74 border-l-transparent border-r-transparent border-b-primary/30 blur-xl" />
      </div>

      <header className="relative z-10 border-b border-foreground/15">
        <div className="container mx-auto flex items-center justify-between gap-5 px-4 py-4 md:gap-8">
          <h1 lang="en" className="text-2xl font-bold tracking-tight text-foreground">
            ownVoice
          </h1>
          <Button
            asChild
            variant="outline"
            className="border-secondary text-foreground hover:bg-secondary/10 hover:text-foreground"
          >
            <Link href="/dashboard">始める</Link>
          </Button>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-linear-to-r from-transparent via-secondary/85 to-transparent"
        />
      </header>

      <main className="relative z-10 container mx-auto flex flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:py-5">
        <section className="relative flex flex-1 items-center justify-center overflow-hidden rounded-3xl px-4 py-4 md:px-8 md:py-6">

          <div className="relative mx-auto max-w-3xl text-center">

            <div className="space-y-2">
              <h2
                lang="en"
                className="text-6xl font-bold leading-tight text-foreground"
              >
                Own Your <span className="rounded-sm bg-primary px-2">Voice</span>
              </h2>

              <p className="text-xl leading-relaxed text-foreground/80">
                AI時代にあえて
                <span className="mx-1 rounded-sm bg-primary px-1.5">自分の言葉</span>
                を研ぎ澄ます
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <Button
                asChild
                className="h-auto rounded-xl bg-primary px-8 py-3 text-lg font-semibold leading-none text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/dashboard">今すぐ書く</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center max-w-5xl mx-auto">
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-secondary/70" />
            <p lang="en" className="text-sm tracking-[0.16em] text-foreground/70">
              WRITING PRINCIPLES
            </p>
            <span className="h-px w-10 bg-secondary/70" />
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            <div className="group flex flex-col items-center rounded-2xl border border-muted bg-white px-4 py-6 text-center shadow-sm transition-colors duration-200 hover:border-secondary md:px-5 md:py-7">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-secondary/45 transition-all duration-200 group-hover:w-16 group-hover:bg-secondary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">良い文章とは</h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                良い文章とは「最後まで読まれる文章」のこと。読み手の興味を引き、途中で離脱されない文章を書くことがゴールです。
              </p>
            </div>

            <div className="group flex flex-col items-center rounded-2xl border border-muted bg-white px-4 py-6 text-center shadow-sm transition-colors duration-200 hover:border-secondary md:px-5 md:py-7">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-secondary/45 transition-all duration-200 group-hover:w-16 group-hover:bg-secondary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">主眼は一つに絞る</h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                一つの文章で伝えることは一つだけ。「何が言いたいのか」を明確にしないまま書き始めると、読み手に伝わりません。
              </p>
            </div>

            <div className="group flex flex-col items-center rounded-2xl border border-muted bg-white px-4 py-6 text-center shadow-sm transition-colors duration-200 hover:border-secondary md:px-5 md:py-7">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-secondary/45 transition-all duration-200 group-hover:w-16 group-hover:bg-secondary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">文章の流れが8割</h3>
              <p className="text-sm leading-relaxed text-foreground/80">
                文章の良し悪しの8割は「流れ」で決まります。
                論理的な構造が読み手を迷わせず、最後まで引っ張る力になります。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
