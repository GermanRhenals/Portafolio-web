import { useCallback, useEffect, useRef, useState } from 'react'

// ========================================
// TIPOS Y CONFIGURACIÓN
// ========================================

/** Define los idiomas disponibles en el portafolio */
type Language = 'es' | 'en'

/**
 * Objeto de contenido multiidioma (i18n)
 * Contiene todos los textos del portafolio en español e inglés
 * - nav: elementos del menú de navegación
 * - contact, role, intro, etc: textos principales
 * - services: lista de servicios ofrecidos
 * Estructura: content[idioma].propiedad
 */
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

/**
 * Lista de frames (fotogramas) disponibles para la animación interactiva
 * Estos corresponden a imágenes que se encuentran en /public/frames/
 * El índice se actualiza según la posición del mouse del usuario
 * Crea un efecto de "scrubbing" tipo video interactivo en el fondo
 * OPTIMIZADO: 30 frames seleccionados para mejor performance sin perder fluidez
 */
const AVAILABLE_FRAMES = [1, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 19, 20, 23, 24, 27, 28, 29, 32, 33, 35, 36, 38, 41, 43, 45, 47, 49, 50, 51] as const

/**
 * COMPONENTE PRINCIPAL: App
 * Portafolio profesional interactivo de German Rhenals
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * 1. Animación de frames interactiva (sigue el mouse)
 * 2. Soporte multiidioma (ES/EN)
 * 3. Menú responsive (desktop y mobile)
 * 4. Secciones: Hero, About, Services, Technologies, Projects, Contact
 */
export default function App() {
  // ========================================
  // ESTADOS (State Management)
  // ========================================

  // Controla si el menú móvil está abierto o cerrado
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Controla la visibilidad de los botones de CTA (call-to-action) con delay
  const [showPills, setShowPills] = useState(false)
  
  // Índice actual del frame mostrado en el fondo
  const [frameIndex, setFrameIndex] = useState(0)
  
  // Idioma actual del portafolio (detecta automáticamente del navegador)
  const [language, setLanguage] = useState<Language>(() => 
    navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
  )

  // Tema oscuro (detecta preferencia del sistema, guarda en localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // ========================================
  // REFERENCIAS (useRef)
  // ========================================

  // Frame objetivo hacia el que animar (basado en posición del mouse)
  const targetFrame = useRef(0)
  
  // ID de la animación requestAnimationFrame para controlar cleanup
  const animationFrame = useRef<number | null>(null)
  
  // Total de frames disponibles (se usa para calcular la posición relativa del mouse)
  const frameCount = AVAILABLE_FRAMES.length

  // ========================================
  // MANEJADORES DE EVENTOS
  // ========================================

  /**
   * Manejador del movimiento del mouse
   * Calcula qué frame mostrar basado en la posición X del cursor
   * Anima suavemente entre frames usando requestAnimationFrame
   * FLUJO:
   * 1. Calcula targetFrame basado en clientX del mouse
   * 2. Si no hay animación en curso, inicia una nueva
   * 3. updateFrame interpola suavemente (distance * 0.35) hasta alcanzar el target
   * 4. Detiene la animación cuando llega al frame objetivo
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Calcula el frame objetivo: posición X del mouse como porcentaje de la ventana
    // Mapea [0, ancho] → [0, frameCount-1]
    targetFrame.current = Math.round((event.clientX / window.innerWidth) * (frameCount - 1))

    // Solo inicia una nueva animación si no hay una en curso
    if (animationFrame.current === null) {
      const updateFrame = () => {
        setFrameIndex((currentFrame) => {
          // Calcula la distancia hacia el frame objetivo
          const distance = targetFrame.current - currentFrame
          
          // Si llegamos al frame objetivo, detiene la animación
          if (Math.abs(distance) < 1) {
            animationFrame.current = null
            return targetFrame.current
          }

          // Continúa la animación (interpola suavemente con factor 0.35)
          animationFrame.current = window.requestAnimationFrame(updateFrame)
          return Math.round(currentFrame + distance * 0.35)
        })
      }

      // Inicia la animación
      animationFrame.current = window.requestAnimationFrame(updateFrame)
    }
  }, [])

  /**
   * EFECTO DE INICIALIZACIÓN
   * Se ejecuta UNA SOLA VEZ al montar el componente
   * RESPONSABILIDADES:
   * 1. Pre-carga todas las imágenes de frames para evitar delays
   * 2. Agrega listener de mousemove
   * 3. Muestra los botones CTA después de 400ms (delay estético)
   * 4. Limpia recursos al desmontar
   */
  useEffect(() => {
    // Guarda la preferencia de dark mode en localStorage
    localStorage.setItem('darkMode', isDarkMode.toString())
    
    // Aplica la clase 'dark' al elemento html para Tailwind CSS
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  /**
   * EFECTO DE INICIALIZACIÓN
   * Se ejecuta UNA SOLA VEZ al montar el componente
   * RESPONSABILIDADES:
   * 1. Pre-carga todas las imágenes de frames para evitar delays
   * 2. Agrega listener de mousemove
   * 3. Muestra los botones CTA después de 400ms (delay estético)
   * 4. Limpia recursos al desmontar
   */
  useEffect(() => {
    // Pre-carga todas las imágenes para que estén listas en caché
    AVAILABLE_FRAMES.forEach((frameNum) => {
      const image = new Image()
      image.src = `${import.meta.env.BASE_URL}frames/frame_${String(frameNum).padStart(6, '0')}.webp`
    })

    // Agrega el listener de movimiento del mouse
    window.addEventListener('mousemove', handleMouseMove)
    
    // Muestra los botones de CTA con delay para mejor UX
    const timer = window.setTimeout(() => setShowPills(true), 400)
    
    // CLEANUP: Remueve listeners y cancela animaciones pendientes
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      // Cancela cualquier animationFrame pendiente
      if (animationFrame.current !== null) {
        window.cancelAnimationFrame(animationFrame.current)
        animationFrame.current = null
      }
      window.clearTimeout(timer)
    }
  }, [handleMouseMove])

  // ========================================
  // OTROS HELPERS
  // ========================================

  // Selecciona el contenido del idioma actual
  const text = content[language]

  /**
   * Copia el email al portapapeles del usuario
   * Utiliza la API moderna Clipboard API
   */
  const copyEmail = async () => {
    await navigator.clipboard.writeText('German35050@gmail.com')
  }

  /**
   * Cambia entre modo claro y oscuro
   * Actualiza el estado y guarda en localStorage automáticamente
   */
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // ========================================
  // RENDERIZADO JSX
  // ========================================

  return (
    <div className="relative min-h-screen w-full bg-white text-black dark:bg-[#0a0e27] dark:text-white selection:bg-black/10 dark:selection:bg-white/10">
      {/* ====== FONDO INTERACTIVO ====== */}
      {/* Imagen de fondo que cambia según la posición del mouse */}
      <img
        src={`${import.meta.env.BASE_URL}frames/frame_${String(AVAILABLE_FRAMES[frameIndex]).padStart(6, '0')}.webp`}
        alt=""
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover object-[50%_center] opacity-100 dark:opacity-50 sm:object-[70%_center]"
      />
      
      {/* Gradiente oscuro sobre la imagen para mejorar legibilidad del texto */}
      {/* Gradiente: más oscuro a la izquierda, más transparente a la derecha */}
      <div className="pointer-events-none fixed inset-0 z-[0] bg-[linear-gradient(90deg,rgba(7,10,16,0.82)_0%,rgba(7,10,16,0.48)_48%,rgba(7,10,16,0.12)_100%)] dark:bg-[linear-gradient(90deg,rgba(10,14,39,0.95)_0%,rgba(10,14,39,0.85)_48%,rgba(10,14,39,0.75)_100%)]" aria-hidden="true" />

      {/* ====== NAVEGACIÓN PRINCIPAL (Desktop + Mobile) ====== */}
      <nav className="fixed left-0 top-0 z-[10] flex w-full items-center border-b border-white/20 bg-black/20 px-4 py-3 text-white backdrop-blur-md dark:border-white/10 dark:bg-black/40 sm:px-6 sm:py-4 md:px-8 md:py-5">
        {/* Logo y nombre */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-6">
          <span className="text-base tracking-tight text-white sm:text-[21px] md:text-[26px]" style={{ fontFamily: 'var(--font-heading)' }}>German Rhenals;</span>
          <span className="select-none text-xl leading-none text-white sm:text-2xl md:text-[30px]">✳︎</span>
          {/* Toggle switch junto al nombre */}
          <button type="button" onClick={toggleDarkMode} className="flex translate-x-1 items-center gap-2 text-xs text-white transition-opacity hover:opacity-80 sm:text-sm md:translate-x-2" aria-label="Modo Oscuro" title="Modo Oscuro">
            <span className="relative block h-6 w-12 rounded-full bg-white/20 transition-colors duration-300 dark:bg-white/30">
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-yellow-300 transition-transform duration-300 dark:translate-x-6 dark:bg-blue-300" />
            </span>
            <span className="hidden lg:inline">Modo Oscuro</span>
          </button>
        </div>

        {/* Menú de navegación (solo visible en md y superiores) */}
        <div className="hidden flex-1 translate-x-1 items-center justify-center gap-0 text-sm text-white md:flex md:text-base lg:text-lg">
          {/* Mapea los elementos del menú con separadores (comas) */}
          {text.nav.map((link, index) => (
            <span key={link}>
              <a href={`#${['about', 'services', 'technologies', 'projects'][index]}`} className="transition-opacity hover:opacity-60">{link}</a>
              {index < text.nav.length - 1 && <span className="mr-2">,</span>}
            </span>
          ))}
        </div>

        {/* Acciones principales alineadas al extremo derecho */}
        <div className="hidden flex-1 items-center justify-end gap-4 md:flex lg:gap-6">
          <a href="#contact" className="text-sm text-white underline underline-offset-2 transition-opacity hover:opacity-60 md:text-base lg:text-lg">{text.contact}</a>
          <button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="text-xs font-medium uppercase tracking-wide text-white transition-opacity hover:opacity-60 md:text-sm" aria-label="Change language">{language === 'es' ? 'EN' : 'ES'}</button>
        </div>

        {/* Botón hamburguesa (menú móvil) - solo visible en pantallas < md */}
        {/* Las 3 líneas se transforman en una "X" con transiciones */}
        <button type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)} className="relative z-[11] flex flex-col gap-[5px] md:hidden">
          {/* Línea superior (rota 45° cuando está abierto) */}
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          {/* Línea central (desaparece cuando está abierto) */}
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          {/* Línea inferior (rota -45° cuando está abierto) */}
          <span className={`h-[2px] w-6 bg-white transition-all duration-300 ${isMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* ====== MENÚ MÓVIL (Overlay) ====== */}
      {/* Solo visible cuando isMenuOpen es true, hidden en md y superiores */}
      <div className={`fixed inset-0 z-[9] flex flex-col justify-center gap-6 bg-[#080b12]/95 dark:bg-[#0a0e27]/95 px-6 text-white backdrop-blur-sm transition-all duration-300 md:hidden ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        {/* Enlaces del menú */}
        {text.nav.map((link, index) => <a key={link} href={`#${['about', 'services', 'technologies', 'projects'][index]}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-medium sm:text-3xl">{link}</a>)}
        {/* Enlace de contacto */}
        <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-medium underline underline-offset-4 sm:text-3xl">{text.contact}</a>
        {/* Botones para cambiar idioma y tema en móvil */}
        <div className="flex gap-4 items-center">
          <button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="w-fit text-base font-medium uppercase sm:text-lg">{language === 'es' ? 'English' : 'Español'}</button>
          {/* Toggle switch para dark mode en móvil */}
          <button type="button" onClick={toggleDarkMode} className="relative w-12 h-6 rounded-full bg-white/20 transition-colors duration-300 dark:bg-white/30" aria-label="Toggle dark mode" title="Modo Oscuro">
            <div className="absolute top-1 left-1 w-4 h-4 bg-yellow-300 rounded-full transition-transform duration-300 dark:translate-x-6 dark:bg-blue-300" />
          </button>
        </div>
      </div>

      {/* ====== CONTENIDO PRINCIPAL ====== */}
      <main className="relative z-[1] w-full px-4 sm:px-6 md:px-8 lg:px-10">
        {/* ====== SECCIÓN HERO ====== */}
        {/* Pantalla completa con contenido al final (móvil) o centrado (desktop) */}
        <section className="flex min-h-screen flex-col justify-end pb-8 sm:pb-12 md:justify-center md:pb-0">
          {/* Contenedor del contenido con borde izquierdo decorativo */}
          <div className="relative z-10 max-w-2xl border-l-2 border-white/70 px-4 py-3 text-white sm:px-5 sm:py-4 md:px-6 md:py-5">
            {/* Label de ubicación/portfolio */}
            <div className="mb-4 select-none text-xs font-medium uppercase tracking-[0.2em] text-white/75 sm:mb-5">
              Portfolio / Cartagena, Colombia
            </div>

            {/* Título principal con respuesta fluida */}
            {/* clamp(min, preferente, max) asegura tamaño óptimo en todos los devices */}
            <h1 className="mb-3 font-medium tracking-tight sm:mb-4" style={{ fontSize: 'clamp(32px, 7vw, 86px)', lineHeight: '0.98' }}>
              German<br />Rhenals
            </h1>

            {/* Rol/profesión */}
            <p className="mb-4 text-base text-white/90 sm:mb-5 sm:text-lg md:text-xl">
              {text.role}
            </p>

            {/* Introducción principal */}
            <p className="mb-4 max-w-xl text-base leading-relaxed text-white/90 sm:mb-5 sm:text-lg md:text-xl">
              {text.intro}
            </p>

            {/* Disponibilidad */}
            <p className="mb-4 text-xs text-white/65 sm:mb-5 sm:text-sm">{text.availability}</p>

            {/* Botones CTA (Call-to-Action) */}
            {/* Animación fade-up con delay de 400ms (controlado en useEffect) */}
            <div className={`flex flex-wrap gap-2 gap-y-2 transition-all duration-300 ${showPills ? 'animate-fade-up opacity-100' : 'opacity-0'}`}>
              {/* Botón 1: Ver proyectos */}
              <a href="#projects" className="inline-flex items-center justify-center rounded-full bg-white px-3 py-2 text-xs text-black transition-colors duration-200 hover:bg-white/80 sm:px-4 sm:py-2 sm:text-sm">{text.projectsTitle}</a>
              
              {/* Botón 2: Copiar email */}
              <button type="button" onClick={copyEmail} className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/60 bg-white/10 px-3 py-2 text-xs text-white transition-colors duration-200 hover:bg-white hover:text-black sm:gap-2 sm:px-4 sm:py-2 sm:text-sm" title={text.copy}>
                {/* Muestra email completo en desktop, solo "Copiar" en móvil */}
                <span className="hidden sm:inline">{text.copy}: <span className="underline underline-offset-1">German35050@gmail.com</span></span>
                <span className="sm:hidden">{text.copy}</span>
                {/* Icono de copiar */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* ====== SECCIONES DE CONTENIDO ====== */}
        {/* Contenedor con fondo diferente que sobresale a los lados */}
        <div className="-mx-4 bg-[#f3f0ea] dark:bg-[#0f1629] px-4 text-[#15181d] dark:text-white sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
          {/* ====== SECCIÓN 01: SOBRE MÍ (ABOUT) ====== */}
          <section id="about" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">01 / {text.aboutTitle}</p>
              {/* Contenido: biografía del desarrollador */}
              <p className="max-w-3xl text-base leading-relaxed sm:text-lg md:text-2xl lg:text-3xl">{text.about}</p>
            </div>
          </section>

          {/* ====== SECCIÓN 02: SERVICIOS ====== */}
          <section id="services" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">02 / {text.servicesTitle}</p>
              {/* Lista de servicios con números secuenciales */}
              <div className="grid border-t border-black/20 dark:border-white/10 md:grid-cols-2">
                {text.services.map((service, index) => (
                  <p key={service} className="border-b border-black/20 dark:border-white/10 py-4 text-base sm:py-5 sm:text-lg md:text-xl lg:text-2xl">
                    <span className="mr-3 text-xs text-black/45 dark:text-white/45 sm:mr-5">0{index + 1}</span>{service}
                  </p>
                ))}
              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 03: TECNOLOGÍAS ====== */}
          <section id="technologies" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">03 / {text.technologiesTitle}</p>
              {/* Tags de tecnologías con bordes */}
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'Node.js', 'MongoDB', 'SQL', 'Unity', 'C#'].map((technology) => (
                  <span key={technology} className="border border-black/25 dark:border-white/20 px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm">{technology}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 04: PROYECTOS DESTACADOS ====== */}
          <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">04 / {text.projectsTitle}</p>
              {/* Contenido del proyecto */}
              <div>
                {/* Nombre del proyecto */}
                <h2 className="mb-3 text-2xl font-medium sm:mb-4 sm:text-3xl md:text-5xl lg:text-6xl">El Rincón Caribeño</h2>
                {/* Descripción del proyecto */}
                <p className="mb-6 max-w-2xl text-base leading-relaxed sm:mb-7 sm:text-lg md:text-xl">{text.projectDescription}</p>
                {/* Enlace al proyecto en vivo */}
                <a href="https://germanrhenals.github.io/Rincon-Caribe-o/" target="_blank" rel="noreferrer" className="inline-flex border-b border-black dark:border-white pb-1 text-xs font-medium uppercase tracking-wide transition-opacity hover:opacity-60 sm:text-sm">{text.viewProject} ↗</a>
              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 05: CONTACTO ====== */}
          <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 pb-20 sm:py-20 sm:pb-24 md:py-28 md:pb-32 lg:py-32">
            {/* Fondo oscuro para contrastar con el resto del contenido */}
            <div className="bg-[#15181d] dark:bg-[#0a0e27] px-5 py-8 text-white sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-12">
              {/* Número y título de sección */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 dark:text-white/40 sm:mb-6">05 / Contact</p>
              
              {/* Título principal */}
              <h2 className="mb-4 text-2xl font-medium sm:mb-5 sm:text-3xl md:text-5xl lg:text-6xl">{text.contactTitle}</h2>
              
              {/* Descripción de contacto */}
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-white/75 dark:text-white/70 sm:mb-7 sm:text-lg md:text-xl">{text.contactText}</p>
              
              {/* CTA principal: Email y CV */}
              <div className="flex flex-wrap items-center gap-3 text-base sm:gap-4 sm:text-lg">
                {/* Email directo */}
                <a href="mailto:German35050@gmail.com" className="underline underline-offset-4 text-sm sm:text-base">German35050@gmail.com</a>
                {/* Botón para descargar CV */}
                <a href={`${import.meta.env.BASE_URL}Hoja_de_vida_German_en.pdf`} target="_blank" rel="noreferrer" className="border border-white/50 dark:border-white/40 px-4 py-2 text-xs transition-colors hover:bg-white hover:text-[#15181d] dark:hover:bg-white/20 dark:hover:text-white sm:px-5 sm:py-2 sm:text-sm">{text.cv}</a>
              </div>
              
              {/* Enlaces a redes sociales */}
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/70 dark:text-white/60 underline underline-offset-4 sm:gap-4 sm:text-sm">
                <a href="https://github.com/GermanRhenals" target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/germ%C3%A1n-rhenals-048b0521b/" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://www.instagram.com/_rhever/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://discord.gg/a9qZ4UUN" target="_blank" rel="noreferrer">Discord</a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
