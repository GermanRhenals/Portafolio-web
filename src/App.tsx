import { useCallback, useEffect, useRef, useState } from 'react'

interface TypewriterResult {
  displayed: string
  done: boolean
}

const useTypewriter = (text: string, speed = 38, startDelay = 600): TypewriterResult => {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let intervalId: number
    const timeoutId = window.setTimeout(() => {
      let index = 0
      intervalId = window.setInterval(() => {
        if (index < text.length) {
          setDisplayed((previous) => previous + text.charAt(index))
          index += 1
        } else {
          setDone(true)
          window.clearInterval(intervalId)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}

const navigationLinks = ['Labs', 'Studio', 'Openings', 'Shop']
const actionLabels = ['Pitch us an idea', 'Come work here', 'Send a brief hello', 'See how we operate']

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPills, setShowPills] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const previousX = useRef<number | null>(null)
  const targetTime = useRef(0)
  const animationFrame = useRef<number | null>(null)
  const sensitivity = 0.8

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const video = videoRef.current
    if (!video || Number.isNaN(video.duration)) return

    if (previousX.current === null) {
      previousX.current = event.clientX
      return
    }

    const delta = event.clientX - previousX.current
    previousX.current = event.clientX
    const timeOffset = (delta / window.innerWidth) * sensitivity * video.duration
    targetTime.current = Math.max(0, Math.min(video.duration, targetTime.current + timeOffset))

    if (animationFrame.current === null) {
      animationFrame.current = window.requestAnimationFrame(() => {
        const currentVideo = videoRef.current
        if (currentVideo) currentVideo.currentTime = targetTime.current
        animationFrame.current = null
      })
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    const timer = window.setTimeout(() => setShowPills(true), 400)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame.current !== null) window.cancelAnimationFrame(animationFrame.current)
      window.clearTimeout(timer)
    }
  }, [handleMouseMove])

  const { displayed, done } = useTypewriter('Glad you stopped in. Good taste tends to find us. Now, what are we building?')

  const copyEmail = async () => {
    await navigator.clipboard.writeText('hello@mainframe.co')
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-black selection:bg-black/10">
      <video
        ref={videoRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover object-[70%_center]"
        src={`${import.meta.env.BASE_URL}videos/movement-a-all-boddy.mp4`}
        muted
        playsInline
        preload="auto"
      />

      <nav className="fixed left-0 top-0 z-[10] flex w-full items-center justify-between bg-transparent px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="text-[21px] tracking-tight text-black sm:text-[26px]" style={{ fontFamily: 'var(--font-heading)' }}>German Rhenals;</span>
          <span className="select-none text-[25px] leading-none text-black sm:text-[30px]">✳︎</span>
        </div>

        <div className="hidden items-center gap-0 text-[23px] text-black md:flex">
          {navigationLinks.map((link, index) => (
            <span key={link}>
              <a href="#" className="transition-opacity hover:opacity-60">{link}</a>
              {index < navigationLinks.length - 1 && <span className="mr-2">,</span>}
            </span>
          ))}
        </div>

        <div className="hidden md:block">
          <a href="#" className="text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60">Get in touch</a>
        </div>

        <button type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)} className="relative z-[11] flex flex-col gap-[5px] md:hidden">
          <span className={`h-[2px] w-6 bg-black transition-all duration-300 ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-[2px] w-6 bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-[2px] w-6 bg-black transition-all duration-300 ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>

      <div className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-all duration-300 md:hidden ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {navigationLinks.map((link) => <a key={link} href="#" className="text-[32px] font-medium text-black">{link}</a>)}
        <a href="#" className="text-[32px] font-medium text-black underline underline-offset-4">Get in touch</a>
      </div>

      <main className="relative z-[1] flex h-screen w-full flex-col justify-end overflow-hidden px-5 pb-12 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          <div className="pointer-events-none mb-5 select-none text-black sm:mb-6" style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: '1.3', fontWeight: 400, filter: 'blur(4px)' }}>
            Hey there, meet A.R.I.A,<br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </div>

          <p className="mb-5 min-h-[54px] text-black sm:mb-6" style={{ fontSize: 'clamp(18px, 4vw, 26px)', lineHeight: '1.35', fontWeight: 400 }}>
            {displayed}
            {!done && <span className="animate-blink ml-[2px] inline-block h-[1.1em] w-[2px] align-middle" />}
          </p>

          <div className={`flex flex-wrap gap-y-1 transition-all duration-300 ${showPills ? 'animate-fade-up opacity-100' : 'opacity-0'}`}>
            {actionLabels.map((label) => <button type="button" key={label} className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-black hover:text-white sm:px-5 sm:text-[15px]">{label}</button>)}
            <button type="button" onClick={copyEmail} className="group mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-transparent px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]">
              <span>Reach us: <span className="underline underline-offset-1">hello@mainframe.co</span></span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
