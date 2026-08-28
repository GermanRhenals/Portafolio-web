import { useCallback, useEffect, useRef, useState } from 'react'

type Language = 'es' | 'en'

const content = {
  es: {
    nav: ['Sobre mí', 'Servicios', 'Tecnologías', 'Proyectos'], contact: 'Hablemos', role: 'Software Developer',
    intro: 'Desarrollo soluciones digitales con disciplina, curiosidad y ganas de afrontar nuevos retos.',
    availability: 'Disponible para oportunidades remotas o en otra ciudad.', aboutTitle: 'Sobre mí',
    about: 'Soy German Rhenals, desarrollador de software con dos años de formación y práctica construyendo proyectos web. También he explorado el desarrollo de videojuegos 2D con Unity a través de proyectos personales. Soy constante, disciplinado y disfruto encontrar la manera de sumar en cada equipo.',
    servicesTitle: 'Lo que puedo aportar', services: ['Desarrollo web', 'Soluciones tecnológicas', 'Soporte TI', 'Mantenimiento de software', 'Implementaciones con IA', 'Automatización'], technologiesTitle: 'Tecnologías', projectsTitle: 'Proyecto destacado',
    projectDescription: 'Portafolio y catálogo de servicios para El Rincón Caribeño, el estadero cubierto más grande de la región.', viewProject: 'Ver proyecto', contactTitle: 'Construyamos algo',
    contactText: 'Estoy abierto a oportunidades laborales, proyectos freelance y retos que me permitan seguir creciendo.', cv: 'Descargar CV', copy: 'Copiar correo',
  },
  en: {
    nav: ['About', 'Services', 'Technologies', 'Projects'], contact: "Let's talk", role: 'Software Developer',
    intro: 'I build digital solutions with discipline, curiosity, and the drive to take on new challenges.',
    availability: 'Available for remote opportunities or relocation.', aboutTitle: 'About me',
    about: 'I am German Rhenals, a software developer with two years of training and hands-on practice building web projects. I have also explored 2D game development with Unity through personal projects. I am consistent, disciplined, and enjoy finding ways to contribute to every team.',
    servicesTitle: 'What I can bring', services: ['Web development', 'Technology solutions', 'IT support', 'Software maintenance', 'AI implementations', 'Automation'], technologiesTitle: 'Technologies', projectsTitle: 'Featured project',
    projectDescription: 'Portfolio and service catalog for El Rincón Caribeño, the largest covered leisure venue in the region.', viewProject: 'View project', contactTitle: "Let's build something",
    contactText: 'I am open to job opportunities, freelance projects, and challenges that help me keep growing.', cv: 'Download CV', copy: 'Copy email',
  },
} as const

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPills, setShowPills] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)
  const [language, setLanguage] = useState<Language>(() => navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es')
  const targetFrame = useRef(0)
  const animationFrame = useRef<number | null>(null)
  const frameCount = 51

  const handleMouseMove = useCallback((event: MouseEvent) => {
    targetFrame.current = Math.round((event.clientX / window.innerWidth) * (frameCount - 1))

    if (animationFrame.current === null) {
      const updateFrame = () => {
        setFrameIndex((currentFrame) => {
          const distance = targetFrame.current - currentFrame
          if (Math.abs(distance) < 1) {
            animationFrame.current = null
            return targetFrame.current
          }

          animationFrame.current = window.requestAnimationFrame(updateFrame)
          return Math.round(currentFrame + distance * 0.35)
        })
      }

      animationFrame.current = window.requestAnimationFrame(updateFrame)
    }
  }, [])

  useEffect(() => {
    for (let index = 1; index <= frameCount; index += 1) {
      const image = new Image()
      image.src = `${import.meta.env.BASE_URL}frames/frame_${String(index).padStart(6, '0')}.webp`
    }

    window.addEventListener('mousemove', handleMouseMove)
    const timer = window.setTimeout(() => setShowPills(true), 400)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current)
        animationFrame.current = null
      }
      window.clearTimeout(timer)
    }
  }, [handleMouseMove])

  const text = content[language]

  const copyEmail = async () => {
    await navigator.clipboard.writeText('German35050@gmail.com')
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-black selection:bg-black/10">
      <img
        src={`${import.meta.env.BASE_URL}frames/frame_${String(frameIndex + 1).padStart(6, '0')}.webp`}
        alt=""
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="pointer-events-none fixed inset-0 z-[0] bg-[linear-gradient(90deg,rgba(7,10,16,0.82)_0%,rgba(7,10,16,0.48)_48%,rgba(7,10,16,0.12)_100%)]" aria-hidden="true" />

      <nav className="fixed left-0 top-0 z-[10] flex w-full items-center justify-between border-b border-white/20 bg-black/20 px-5 py-4 text-white backdrop-blur-md sm:px-8 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="text-[21px] tracking-tight text-white sm:text-[26px]" style={{ fontFamily: 'var(--font-heading)' }}>German Rhenals;</span>
          <span className="select-none text-[25px] leading-none text-white sm:text-[30px]">✳︎</span>
        </div>

        <div className="hidden items-center gap-0 text-[18px] text-white lg:text-[20px] md:flex">
          {text.nav.map((link, index) => (
            <span key={link}>
              <a href={`#${['about', 'services', 'technologies', 'projects'][index]}`} className="transition-opacity hover:opacity-60">{link}</a>
              {index < text.nav.length - 1 && <span className="mr-2">,</span>}
            </span>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a href="#contact" className="text-[18px] text-white underline underline-offset-2 transition-opacity hover:opacity-60 lg:text-[20px]">{text.contact}</a>
          <button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="text-sm font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-60" aria-label="Change language">{language === 'es' ? 'EN' : 'ES'}</button>
        </div>

        <button type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)} className="relative z-[11] flex flex-col gap-[5px] md:hidden">
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>

      <div className={`fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-[#080b12]/95 px-8 text-white backdrop-blur-sm transition-all duration-300 md:hidden ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {text.nav.map((link, index) => <a key={link} href={`#${['about', 'services', 'technologies', 'projects'][index]}`} onClick={() => setIsMenuOpen(false)} className="text-[32px] font-medium">{link}</a>)}
        <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-[32px] font-medium underline underline-offset-4">{text.contact}</a>
        <button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="w-fit text-lg font-medium uppercase">{language === 'es' ? 'English' : 'Español'}</button>
      </div>

      <main className="relative z-[1] w-full px-5 sm:px-8 md:px-10">
        <section className="flex min-h-screen flex-col justify-end pb-12 md:justify-center md:pb-0">
        <div className="relative z-10 max-w-2xl border-l-2 border-white/70 px-5 py-3 text-white sm:px-7 sm:py-5">
          <div className="mb-5 select-none text-xs font-medium uppercase tracking-[0.2em] text-white/75 sm:mb-6">
            Portfolio / Cartagena, Colombia
          </div>

          <h1 className="mb-4 font-medium tracking-tight" style={{ fontSize: 'clamp(42px, 8vw, 86px)', lineHeight: '0.98' }}>
            German<br />Rhenals
          </h1>
          <p className="mb-5 text-lg text-white/90 sm:mb-6 sm:text-2xl">
            {text.role}
          </p>
          <p className="mb-5 max-w-xl text-lg leading-relaxed text-white/90 sm:mb-6 sm:text-2xl">
            {text.intro}
          </p>
          <p className="mb-5 text-sm text-white/65 sm:text-base">{text.availability}</p>

          <div className={`flex flex-wrap gap-y-1 transition-all duration-300 ${showPills ? 'animate-fade-up opacity-100' : 'opacity-0'}`}>
            <a href="#projects" className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center rounded-full bg-white px-4 py-[0.3em] text-[13px] text-black transition-colors duration-200 hover:bg-white/80 sm:px-5 sm:text-[15px]">{text.projectsTitle}</a>
            <button type="button" onClick={copyEmail} className="group mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/60 bg-white/10 px-4 py-[0.3em] text-[13px] text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-3 sm:px-5 sm:text-[15px]" title={text.copy}>
              <span>{text.copy}: <span className="underline underline-offset-1">German35050@gmail.com</span></span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
        </section>

        <div className="-mx-5 bg-[#f3f0ea] px-5 text-[#15181d] sm:-mx-8 sm:px-8 md:-mx-10 md:px-10">
          <section id="about" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 py-24 md:py-32">
            <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">01 / {text.aboutTitle}</p>
              <p className="max-w-3xl text-xl leading-relaxed md:text-3xl">{text.about}</p>
            </div>
          </section>

          <section id="services" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 py-24 md:py-32">
            <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">02 / {text.servicesTitle}</p>
              <div className="grid border-t border-black/20 md:grid-cols-2">
                {text.services.map((service, index) => <p key={service} className="border-b border-black/20 py-5 text-xl md:text-2xl"><span className="mr-5 text-xs text-black/45">0{index + 1}</span>{service}</p>)}
              </div>
            </div>
          </section>

          <section id="technologies" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 py-24 md:py-32">
            <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">03 / {text.technologiesTitle}</p>
              <div className="flex flex-wrap gap-2">{['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'Node.js', 'MongoDB', 'SQL', 'Unity', 'C#'].map((technology) => <span key={technology} className="border border-black/25 px-3 py-2 text-sm">{technology}</span>)}</div>
            </div>
          </section>

          <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 py-24 md:py-32">
            <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">04 / {text.projectsTitle}</p>
              <div>
                <h2 className="mb-4 text-4xl font-medium md:text-6xl">El Rincón Caribeño</h2>
                <p className="mb-8 max-w-2xl text-lg leading-relaxed md:text-xl">{text.projectDescription}</p>
                <a href="https://germanrhenals.github.io/Rincon-Caribe-o/" target="_blank" rel="noreferrer" className="inline-flex border-b border-black pb-1 text-sm font-medium uppercase tracking-wide transition-opacity hover:opacity-60">{text.viewProject} ↗</a>
              </div>
            </div>
          </section>

          <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 py-24 pb-32 md:py-32">
            <div className="bg-[#15181d] px-6 py-10 text-white md:px-12 md:py-16">
              <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">05 / Contact</p>
              <h2 className="mb-5 text-4xl font-medium md:text-6xl">{text.contactTitle}</h2>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">{text.contactText}</p>
              <div className="flex flex-wrap items-center gap-5 text-lg"><a href="mailto:German35050@gmail.com" className="underline underline-offset-4">German35050@gmail.com</a><a href={`${import.meta.env.BASE_URL}Hoja_de_vida_German_en.pdf`} target="_blank" rel="noreferrer" className="border border-white/50 px-5 py-2 text-sm transition-colors hover:bg-white hover:text-[#15181d]">{text.cv}</a></div>
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-white/70 underline underline-offset-4"><a href="https://github.com/GermanRhenals" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/germ%C3%A1n-rhenals-048b0521b/" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.instagram.com/_rhever/" target="_blank" rel="noreferrer">Instagram</a><a href="https://discord.gg/a9qZ4UUN" target="_blank" rel="noreferrer">Discord</a></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
