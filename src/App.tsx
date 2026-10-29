import { useCallback, useEffect, useRef, useState } from 'react'
import { castVote, fetchVoteCounts } from './game-vote'
import type { GameNameOption, VoteCounts } from './game-vote'

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
    nav: ['Sobre mí', 'Servicios', 'Tecnologías', 'Novedades', 'Proyectos'], contact: 'Hablemos', role: 'Software Developer',
    intro: 'Desarrollo soluciones digitales con disciplina, curiosidad y ganas de afrontar nuevos retos.',
    availability: 'Disponible para oportunidades remotas o en otra ciudad.', aboutTitle: 'Sobre mí',
    about: 'Soy German Rhenals, desarrollador de software con dos años de formación y práctica construyendo proyectos web. También he explorado el desarrollo de videojuegos 2D con Unity a través de proyectos personales. Soy constante, disciplinado y disfruto encontrar la manera de sumar en cada equipo.',
    servicesTitle: 'Lo que puedo aportar', services: ['Desarrollo web', 'Soluciones tecnológicas', 'Soporte TI', 'Mantenimiento de software', 'Implementaciones con IA', 'Automatización'], technologiesTitle: 'Tecnologías', updatesTitle: 'Novedades', updatesIntro: 'Arranca el desarrollo de nuestro primer videojuego.', updates: [
      { status: 'Nuevo proyecto', title: 'Nuestro primer videojuego', description: 'Un shooter narrativo desde la perspectiva de un soldado que narra las operaciones de las Fuerzas Militares de Colombia contra las guerrillas en el territorio nacional. La historia se divide en tres actos, cada uno con al menos tres submisiones, hasta completar quince operaciones. Cada misión está pensada para durar al menos quince minutos, entre balas, ríos, jungla y selva colombiana, con cinemáticas cuidadas y desarrollo de personajes.', link: 'Votar por el nombre', href: '#game-vote' },
    ], projectsTitle: 'Proyecto destacado',
    projectDescription: 'Portafolio y catálogo de servicios para El Rincón Caribeño, el estadero cubierto más grande de la región.', viewProject: 'Ver proyecto', inConstruction: 'Proyecto en operación',
    inConstructionEyebrow: 'Primeros clientes', inConstructionTitle: 'Kuantika POS', inConstructionDescription: 'Punto de venta para bares y establecimientos que conecta sala, barra e inventario en tiempo real: del pedido al pago y al cierre de turno.',
    inConstructionStatus: 'En operación', inConstructionGoal: 'Objetivo', inConstructionGoalValue: 'Ventas e inventarios', inConstructionCapabilitiesTitle: 'Lo que hace la aplicación', inConstructionCapabilities: [
      { title: 'Pedidos de sala al bar', description: 'El mesero envía el pedido desde la mesa y el bar lo despacha con su stock, su pago y su estado actualizados al instante.' },
      { title: 'Inventario y ventas', description: 'Cada despacho y cada venta en barra descuenta existencias; los incidentes y pérdidas ajustan el inventario y suman al total del turno.' },
      { title: 'Turnos, equipo e informes', description: 'Roles de administrador, mesero y bar, cierre de turno y un resumen de ventas, pedidos pendientes y stock bajo en una sola vista.' },
    ], inConstructionRepository: 'Ver repositorio', inConstructionLive: 'Ver la web', inConstructionNote: 'Proyecto open source en operación con clientes reales.',
    enSilla: 'En Silla en operación', enSillaEyebrow: 'Ahora en operación', enSillaTitle: 'En Silla',
    enSillaDescription: 'Marketplace de reservas para barberías de barrio: el cliente busca su barbería, elige servicio, barbero y horario, y confirma en minutos. Cada barbería administra su agenda, sus clientes y su equipo desde un panel privado, con los datos aislados de las demás.',
    enSillaStatus: 'En operación', enSillaGoal: 'Objetivo', enSillaGoalValue: 'Reservas, agenda y clientes', enSillaNote: 'Marketplace público con alta autoservicio y despliegue estático.',
    enSillaCapabilitiesTitle: 'Lo que hace la aplicación', enSillaCapabilities: [
      { title: 'Reservas online', description: 'Búsqueda por barbería, selección de servicio, barbero y horario, y confirmación con un enlace único que funciona como credencial.' },
      { title: 'Agenda y fichas de clientes', description: 'Panel privado con agenda diaria, historial de citas, ideas de corte y estadísticas para que la operación no dependa de una sola persona.' },
      { title: 'Multi-barbería con roles', description: 'Aislamiento por barbería con RLS en Postgres; el administrador controla todo y cada barbero ve solo su agenda y sus métricas.' },
    ], enSillaUpdatesTitle: 'Nuevas actualizaciones', enSillaUpdates: [
      { title: 'Marketplace multi-barbería', description: 'El esquema pasó de una barbería única a varias, conservando los datos existentes y aislados por RLS.' },
      { title: 'Alta autoservicio', description: 'El dueño crea su barbería, confirma el correo y publica cuando tiene servicio, horario y equipo.' },
      { title: 'Confirmación y recordatorios', description: 'Enlace único de confirmación, descarga de calendario (.ics), contacto por WhatsApp y recordatorio por correo.' },
    ], enSillaApiTitle: 'API de envío de mensajes', enSillaApiDescription: 'En Silla consume una API de envío de mensajes desde Supabase Edge Functions: las claves de Brevo o Resend viven como secretos en el servidor y nunca llegan al navegador. A nivel informativo, el envío es transaccional —confirmación del alta de una barbería y recordatorios de turno—, no una herramienta de campañas masivas.',
    enSillaRepository: 'Ver repositorio', enSillaLive: 'Ver la web',
    gameVoteEyebrow: 'Votación abierta', gameVoteTitle: 'Ponle nombre al juego', gameVoteIntro: 'Todavía no tiene nombre. Estas son las cuatro opciones finales: el nombre que reciba más votos será el aceptado.', gameVoteNote: 'Un voto por persona cada 10 minutos. Los resultados se actualizan al instante.', gameVoteButton: 'Votar', gameVoteVoting: 'Votando…', gameVoteVoted: 'Votado', gameVoteLeader: 'Más votado', gameVoteTotal: 'votos', gameVoteLoading: 'Cargando votos…',
    gameVoteOk: '¡Gracias! Tu voto quedó registrado.', gameVoteAlready: 'Ya hay un voto registrado desde este dispositivo. Podrás votar de nuevo en unos minutos.', gameVoteError: 'No pudimos registrar el voto. Inténtalo de nuevo en un momento.', gameVoteUnavailable: 'No pudimos cargar los votos en este momento. Aun así puedes intentar votar.',
    gameNameOptions: [
      { key: 'shadows-of-duty', title: 'Sombras del Deber', subtitle: 'Shadows of Duty' },
      { key: 'green-crossfire', title: 'Fuego Verde', subtitle: 'Green Crossfire' },
      { key: 'ghost-protocol', title: 'Protocolo Fantasma', subtitle: 'Ghost Protocol' },
      { key: 'memory-of-shadows', title: 'Memoria de Sombras', subtitle: 'Memory of Shadows' },
    ],
    contactTitle: 'Construyamos algo', contactText: 'Estoy abierto a oportunidades laborales, proyectos freelance y retos que me permitan seguir creciendo.', cv: 'Descargar CV', copy: 'Copiar correo',
  },
  en: {
    nav: ['About', 'Services', 'Technologies', 'Updates', 'Projects'], contact: "Let's talk", role: 'Software Developer',
    intro: 'I build digital solutions with discipline, curiosity, and the drive to take on new challenges.',
    availability: 'Available for remote opportunities or relocation.', aboutTitle: 'About me',
    about: 'I am German Rhenals, a software developer with two years of training and hands-on practice building web projects. I have also explored 2D game development with Unity through personal projects. I am consistent, disciplined, and enjoy finding ways to contribute to every team.',
    servicesTitle: 'What I can bring', services: ['Web development', 'Technology solutions', 'IT support', 'Software maintenance', 'AI implementations', 'Automation'], technologiesTitle: 'Technologies', updatesTitle: 'Latest updates', updatesIntro: 'Development has started on our first video game.', updates: [
      { status: 'New project', title: 'Our first video game', description: 'A narrative shooter from the perspective of a soldier who recounts the operations of the Colombian Military Forces against guerrilla groups across the national territory. The story is split into three acts, each with at least three sub-missions, for a total of fifteen operations. Every mission is designed to last at least fifteen minutes, amid bullets, rivers, jungle, and the Colombian rainforest, with polished cinematics and character development.', link: 'Vote on the name', href: '#game-vote' },
    ], projectsTitle: 'Featured project',
    projectDescription: 'Portfolio and service catalog for El Rincón Caribeño, the largest covered leisure venue in the region.', viewProject: 'View project', inConstruction: 'Project in operation',
    inConstructionEyebrow: 'First clients', inConstructionTitle: 'Kuantika POS', inConstructionDescription: 'A point of sale for bars and venues that connects floor, bar, and inventory in real time: from order to payment to shift close.',
    inConstructionStatus: 'In operation', inConstructionGoal: 'Goal', inConstructionGoalValue: 'Sales and inventory', inConstructionCapabilitiesTitle: 'What the app does', inConstructionCapabilities: [
      { title: 'Floor-to-bar orders', description: 'Waiters send the order from the table and the bar fulfills it with stock, payment, and status updated instantly.' },
      { title: 'Inventory and sales', description: 'Every dispatch and every direct sale deducts stock; incidents and losses adjust inventory and add to the shift total.' },
      { title: 'Shifts, team, and reports', description: 'Admin, waiter, and bar roles, shift close, and a single summary of sales, pending orders, and low stock.' },
    ], inConstructionRepository: 'View repository', inConstructionLive: 'View live site', inConstructionNote: 'Open-source project in operation with real clients.',
    enSilla: 'En Silla in operation', enSillaEyebrow: 'Now in operation', enSillaTitle: 'En Silla',
    enSillaDescription: 'A booking marketplace for neighborhood barbershops: clients find their shop, choose a service, barber, and time, and confirm in minutes. Each shop manages its schedule, clients, and team from a private panel, with its data isolated from the rest.',
    enSillaStatus: 'In operation', enSillaGoal: 'Goal', enSillaGoalValue: 'Bookings, schedule, and clients', enSillaNote: 'Public marketplace with self-service signup and static deployment.',
    enSillaCapabilitiesTitle: 'What the app does', enSillaCapabilities: [
      { title: 'Online bookings', description: 'Search by barbershop, choose a service, barber, and time, and confirm with a unique link that works as a credential.' },
      { title: 'Schedule and client profiles', description: 'Private panel with the daily schedule, appointment history, haircut ideas, and stats so operations do not depend on a single person.' },
      { title: 'Multi-shop with roles', description: 'Per-shop isolation through Postgres RLS; the admin controls everything and each barber only sees their own schedule and metrics.' },
    ], enSillaUpdatesTitle: 'New updates', enSillaUpdates: [
      { title: 'Multi-shop marketplace', description: 'The schema moved from a single barbershop to many, preserving existing data and isolating it through RLS.' },
      { title: 'Self-service signup', description: 'Owners create their shop, confirm their email, and publish once they have a service, schedule, and team.' },
      { title: 'Confirmation and reminders', description: 'Unique confirmation link, calendar download (.ics), WhatsApp contact, and email reminders.' },
    ], enSillaApiTitle: 'Messaging API', enSillaApiDescription: 'En Silla consumes a messaging API from Supabase Edge Functions: the Brevo or Resend keys live as server-side secrets and never reach the browser. For information purposes, sending is transactional —barbershop signup confirmation and appointment reminders—, not a mass-campaign tool.',
    enSillaRepository: 'View repository', enSillaLive: 'View live site',
    gameVoteEyebrow: 'Voting open', gameVoteTitle: 'Name the game', gameVoteIntro: 'It does not have a name yet. These are the four final options: the name with the most votes will be the one accepted.', gameVoteNote: 'One vote per person every 10 minutes. Results update instantly.', gameVoteButton: 'Vote', gameVoteVoting: 'Voting…', gameVoteVoted: 'Voted', gameVoteLeader: 'Leading', gameVoteTotal: 'votes', gameVoteLoading: 'Loading votes…',
    gameVoteOk: 'Thanks! Your vote has been recorded.', gameVoteAlready: 'A vote from this device is already registered. You can vote again in a few minutes.', gameVoteError: 'We could not record your vote. Please try again in a moment.', gameVoteUnavailable: 'We could not load the votes right now. You can still try to vote.',
    gameNameOptions: [
      { key: 'shadows-of-duty', title: 'Shadows of Duty', subtitle: 'Sombras del Deber' },
      { key: 'green-crossfire', title: 'Green Crossfire', subtitle: 'Fuego Verde' },
      { key: 'ghost-protocol', title: 'Ghost Protocol', subtitle: 'Protocolo Fantasma' },
      { key: 'memory-of-shadows', title: 'Memory of Shadows', subtitle: 'Memoria de Sombras' },
    ],
    contactTitle: "Let's build something", contactText: 'I am open to job opportunities, freelance projects, and challenges that help me keep growing.', cv: 'Download CV', copy: 'Copy email',
  },
} as const

/**
 * Lista de frames (fotogramas) disponibles para la animación interactiva
 * Estos corresponden a imágenes que se encuentran en /public/frames/
 * El índice se actualiza según la posición del mouse del usuario
 * Crea un efecto de "scrubbing" tipo video interactivo en el fondo
 * OPTIMIZADO: 40 frames seleccionados para equilibrar fluidez y performance
 */
const AVAILABLE_FRAMES = [1, 4, 5, 6, 7, 8, 9, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 43, 45, 47, 49, 50, 51] as const

// ========================================
// VOTACIÓN DEL VIDEOJUEGO
// ========================================

/** Marca local para no repetir el voto mientras dure el enfriamiento del backend. */
const VOTE_STORAGE_KEY = 'gameNameVote'
const VOTE_COOLDOWN_MS = 10 * 60 * 1000

type VoteFeedback = 'idle' | 'ok' | 'already' | 'error'

/** Lee la marca local del voto; si ya expiró, la descarta. */
function readStoredVote(): { hasVoted: boolean; feedback: VoteFeedback; option: GameNameOption | null } {
  try {
    const stored = localStorage.getItem(VOTE_STORAGE_KEY)
    if (!stored) return { hasVoted: false, feedback: 'idle', option: null }

    const parsed = JSON.parse(stored) as { at?: number; option?: GameNameOption }
    if (typeof parsed.at === 'number' && Date.now() - parsed.at < VOTE_COOLDOWN_MS) {
      return { hasVoted: true, feedback: 'already', option: parsed.option ?? null }
    }

    localStorage.removeItem(VOTE_STORAGE_KEY)
  } catch {
    // Si localStorage no está disponible, seguimos sin marca local.
  }

  return { hasVoted: false, feedback: 'idle', option: null }
}

/** Guarda la marca local del voto con la hora en que se emitió. */
function storeVote(option: GameNameOption) {
  try {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify({ option, at: Date.now() }))
  } catch {
    // Sin localStorage el voto igual quedó registrado en Supabase.
  }
}


/**
 * COMPONENTE PRINCIPAL: App
 * Portafolio profesional interactivo de German Rhenals
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * 1. Animación de frames interactiva (sigue el mouse)
 * 2. Soporte multiidioma (ES/EN)
 * 3. Menú responsive (desktop y mobile)
 * 4. Secciones: Hero, About, Services, Technologies, Updates, Projects, Contact
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

  // Tema oscuro (modo claro por defecto, guarda la elección en localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return false
  })

  // Votación del nombre del videojuego
  const [storedVote] = useState(readStoredVote)
  const [voteCounts, setVoteCounts] = useState<VoteCounts | null>(null)
  const [voteLoading, setVoteLoading] = useState(true)
  const [voteLoadFailed, setVoteLoadFailed] = useState(false)
  const [votingFor, setVotingFor] = useState<GameNameOption | null>(null)
  const [hasVoted, setHasVoted] = useState(storedVote.hasVoted)
  const [votedOption, setVotedOption] = useState<GameNameOption | null>(storedVote.option)
  const [voteFeedback, setVoteFeedback] = useState<VoteFeedback>(storedVote.feedback)

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
  }, [frameCount])

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
   * CARGA INICIAL DE LA VOTACIÓN
   * Trae los conteos desde Supabase. La marca local del voto se resuelve en el
   * estado inicial para no encadenar renders desde el efecto.
   */
  useEffect(() => {
    let cancelled = false

    fetchVoteCounts()
      .then((counts) => {
        if (!cancelled) setVoteCounts(counts)
      })
      .catch(() => {
        if (!cancelled) setVoteLoadFailed(true)
      })
      .finally(() => {
        if (!cancelled) setVoteLoading(false)
      })

    return () => {
      cancelled = true
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

  /**
   * Registra un voto por uno de los nombres del videojuego.
   * El backend aplica el enfriamiento por IP; acá solo se evita el doble clic
   * y se guarda una marca local para que la interfaz refleje el estado.
   */
  const handleVote = async (option: GameNameOption) => {
    if (hasVoted || votingFor !== null) return

    setVotingFor(option)
    setVoteFeedback('idle')

    const result = await castVote(option)
    setVotingFor(null)

    if (result.ok) {
      setVoteCounts(result.counts)
      setVoteLoadFailed(false)
      setHasVoted(true)
      setVotedOption(option)
      setVoteFeedback('ok')
      storeVote(option)
      return
    }

    if (result.reason === 'already') {
      setHasVoted(true)
      setVoteFeedback('already')
      return
    }

    setVoteFeedback('error')
  }

  // Entradas de la votación con sus conteos y el líder actual (si no hay empate)
  const gameNameEntries = text.gameNameOptions.map((option) => ({
    ...option,
    votes: voteCounts?.[option.key] ?? 0,
  }))
  const totalVotes = gameNameEntries.reduce((sum, option) => sum + option.votes, 0)
  const topVotes = gameNameEntries.reduce((max, option) => Math.max(max, option.votes), 0)
  const leaders = gameNameEntries.filter((option) => option.votes === topVotes && topVotes > 0)
  const hasUniqueLeader = leaders.length === 1

  const voteFeedbackMessage = {
    ok: text.gameVoteOk,
    already: text.gameVoteAlready,
    error: text.gameVoteError,
    idle: '',
  }[voteFeedback]

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
              <a href={`#${['about', 'services', 'technologies', 'updates', 'projects'][index]}`} className="transition-opacity hover:opacity-60">{link}</a>
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
        {text.nav.map((link, index) => <a key={link} href={`#${['about', 'services', 'technologies', 'updates', 'projects'][index]}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-medium sm:text-3xl">{link}</a>)}
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

          {/* ====== SECCIÓN 04: NOVEDADES ====== */}
          <section id="updates" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">04 / {text.updatesTitle}</p>
              <div>
                <p className="mb-8 max-w-2xl text-base leading-relaxed text-black/65 dark:text-white/65 sm:text-lg">{text.updatesIntro}</p>
                <div className={`grid gap-4 ${text.updates.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                  {text.updates.map((update) => {
                    const isInternalLink = update.href.startsWith('#')
                    return (
                      <article key={update.title} className="flex flex-col border border-black/20 bg-white/45 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">{update.status}</p>
                        <h2 className="mb-3 text-xl font-medium sm:text-2xl">{update.title}</h2>
                        <p className="mb-6 flex-1 text-sm leading-relaxed text-black/70 dark:text-white/70 sm:text-base">{update.description}</p>
                        <a href={update.href} target={isInternalLink ? undefined : '_blank'} rel={isInternalLink ? undefined : 'noreferrer'} className="w-fit border-b border-black pb-1 text-xs font-medium uppercase tracking-wide transition-opacity hover:opacity-60 dark:border-white sm:text-sm">{update.link} {isInternalLink ? '↓' : '↗'}</a>
                      </article>
                    )
                  })}
                </div>

                {/* Votación del nombre del videojuego */}
                <div id="game-vote" className="mt-10 scroll-mt-24 border border-black/20 bg-white/55 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-black/15 pb-5 dark:border-white/10">
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50 dark:text-white/50">{text.gameVoteEyebrow}</p>
                      <h3 className="mb-2 text-xl font-medium sm:text-2xl">{text.gameVoteTitle}</h3>
                      <p className="max-w-2xl text-sm leading-relaxed text-black/65 dark:text-white/65 sm:text-base">{text.gameVoteIntro}</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] dark:border-white/20 sm:text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {voteLoading ? text.gameVoteLoading : voteLoadFailed ? '—' : `${totalVotes} ${text.gameVoteTotal}`}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {gameNameEntries.map((option) => {
                      const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                      const isLeader = hasUniqueLeader && option.key === leaders[0].key
                      const isVoted = option.key === votedOption
                      const isVoting = votingFor === option.key
                      const borderClass = isVoted
                        ? 'border-emerald-500 dark:border-emerald-400'
                        : hasVoted
                          ? 'border-black/15 dark:border-white/10'
                          : 'border-black/20 hover:border-black/60 dark:border-white/15 dark:hover:border-white/60'

                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleVote(option.key)}
                          disabled={hasVoted || votingFor !== null}
                          className={`group flex w-full flex-col border p-4 text-left transition-colors sm:p-5 ${hasVoted ? 'cursor-default' : ''} ${borderClass}`}
                        >
                          <span className="mb-3 flex items-start justify-between gap-3">
                            <span className="block">
                              <span className="block text-base font-medium sm:text-lg">{option.title}</span>
                              <span className="block text-xs text-black/50 dark:text-white/50">{option.subtitle}</span>
                            </span>
                            <span className="flex shrink-0 flex-col items-end gap-1">
                              {isLeader && (
                                <span className="rounded-full bg-[#15181d] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white dark:bg-white dark:text-[#15181d]">{text.gameVoteLeader}</span>
                              )}
                              {isVoted && (
                                <span className="rounded-full border border-emerald-500 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-400 dark:text-emerald-300">{text.gameVoteVoted}</span>
                              )}
                            </span>
                          </span>

                          <span className="mb-2 flex items-baseline justify-between gap-2 text-xs text-black/55 dark:text-white/55">
                            <span>{voteLoading || voteLoadFailed ? '—' : `${option.votes} ${text.gameVoteTotal}`}</span>
                            <span>{voteLoading || voteLoadFailed ? '' : `${percentage}%`}</span>
                          </span>

                          <span className="block h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                            <span className="block h-full rounded-full bg-[#15181d] transition-all duration-500 dark:bg-white" style={{ width: `${percentage}%` }} />
                          </span>

                          {!hasVoted && (
                            <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45 transition-colors group-hover:text-black dark:text-white/45 dark:group-hover:text-white">
                              {isVoting ? text.gameVoteVoting : text.gameVoteButton} →
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-black/50 dark:text-white/50">{text.gameVoteNote}</p>

                  {voteFeedback !== 'idle' && (
                    <p className={`mt-3 border-l-2 pl-3 text-xs leading-relaxed sm:text-sm ${voteFeedback === 'error' ? 'border-red-500 text-red-700 dark:text-red-300' : 'border-emerald-500 text-emerald-700 dark:text-emerald-300'}`}>
                      {voteFeedbackMessage}
                    </p>
                  )}

                  {voteLoadFailed && voteFeedback !== 'error' && (
                    <p className="mt-3 border-l-2 border-amber-500 pl-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300 sm:text-sm">{text.gameVoteUnavailable}</p>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 05: PROYECTOS DESTACADOS ====== */}
          <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">05 / {text.projectsTitle}</p>
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

          {/* ====== SECCIÓN 06: PROYECTO EN CONSTRUCCIÓN ====== */}
          <section id="in-construction" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">06 / {text.inConstruction}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-black/45 dark:text-white/45">{text.inConstructionEyebrow}</p>
              </div>

              {/* Tarjeta del proyecto en desarrollo */}
              <div className="group relative overflow-hidden border border-black/20 bg-white/55 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-7 md:p-9 lg:p-11">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d9e7ff] opacity-50 blur-3xl transition-transform duration-700 group-hover:scale-125 dark:bg-blue-500/20" aria-hidden="true" />
                <div className="relative">
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-black/15 pb-5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15181d] text-sm text-white dark:bg-white dark:text-[#15181d]">B</span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">{text.inConstructionStatus}</p>
                        <h2 className="text-2xl font-medium sm:text-3xl md:text-4xl">{text.inConstructionTitle}</h2>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] dark:border-white/20 sm:text-xs">
                      <span className="h-2 w-2 animate-blink rounded-full bg-amber-500" />
                      {text.inConstructionStatus}
                    </span>
                  </div>

                  <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">{text.inConstructionDescription}</p>

                  <div className="mb-7 grid gap-3 sm:grid-cols-2">
                    <div className="border border-black/15 px-4 py-4 dark:border-white/10">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.inConstructionGoal}</p>
                      <p className="text-sm sm:text-base">{text.inConstructionGoalValue}</p>
                    </div>
                    <div className="border border-black/15 px-4 py-4 dark:border-white/10">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.inConstructionStatus}</p>
                      <p className="text-sm sm:text-base">{text.inConstructionNote}</p>
                    </div>
                  </div>

                  <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.inConstructionCapabilitiesTitle}</p>
                  <div className="mb-7 grid gap-3 md:grid-cols-3">
                    {text.inConstructionCapabilities.map((capability) => (
                      <div key={capability.title} className="border border-black/15 px-4 py-4 dark:border-white/10">
                        <p className="mb-1 text-sm font-medium sm:text-base">{capability.title}</p>
                        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">{capability.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <a href="https://germanrhenals.github.io/pos-systems/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-black pb-1 text-xs font-medium uppercase tracking-wide transition-opacity hover:opacity-60 dark:border-white sm:text-sm">
                      {text.inConstructionLive} ↗
                    </a>
                    <a href="https://github.com/GermanRhenals/pos-systems" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-black/30 pb-1 text-xs font-medium uppercase tracking-wide text-black/60 transition-opacity hover:opacity-60 dark:border-white/30 dark:text-white/60 sm:text-sm">
                      {text.inConstructionRepository} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 07: EN SILLA EN OPERACIÓN ====== */}
          <section id="ensilla" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 sm:py-20 md:py-28 lg:py-32">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-16">
              {/* Número y título de sección */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50 dark:text-white/50">07 / {text.enSilla}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-black/45 dark:text-white/45">{text.enSillaEyebrow}</p>
              </div>

              {/* Tarjeta del proyecto en operación */}
              <div className="group relative overflow-hidden border border-black/20 bg-white/55 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:p-7 md:p-9 lg:p-11">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#d7f5e4] opacity-60 blur-3xl transition-transform duration-700 group-hover:scale-125 dark:bg-emerald-500/20" aria-hidden="true" />
                <div className="relative">
                  <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-black/15 pb-5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15181d] text-sm text-white dark:bg-white dark:text-[#15181d]">E</span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-black/45 dark:text-white/45">{text.enSillaStatus}</p>
                        <h2 className="text-2xl font-medium sm:text-3xl md:text-4xl">{text.enSillaTitle}</h2>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] dark:border-white/20 sm:text-xs">
                      <span className="h-2 w-2 animate-blink rounded-full bg-emerald-500" />
                      {text.enSillaStatus}
                    </span>
                  </div>

                  <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg md:text-xl">{text.enSillaDescription}</p>

                  <div className="mb-7 grid gap-3 sm:grid-cols-2">
                    <div className="border border-black/15 px-4 py-4 dark:border-white/10">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.enSillaGoal}</p>
                      <p className="text-sm sm:text-base">{text.enSillaGoalValue}</p>
                    </div>
                    <div className="border border-black/15 px-4 py-4 dark:border-white/10">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.enSillaStatus}</p>
                      <p className="text-sm sm:text-base">{text.enSillaNote}</p>
                    </div>
                  </div>

                  <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.enSillaCapabilitiesTitle}</p>
                  <div className="mb-7 grid gap-3 md:grid-cols-3">
                    {text.enSillaCapabilities.map((capability) => (
                      <div key={capability.title} className="border border-black/15 px-4 py-4 dark:border-white/10">
                        <p className="mb-1 text-sm font-medium sm:text-base">{capability.title}</p>
                        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">{capability.description}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.enSillaUpdatesTitle}</p>
                  <ul className="mb-7 grid gap-3">
                    {text.enSillaUpdates.map((update) => (
                      <li key={update.title} className="flex gap-3 border-b border-black/10 pb-3 last:border-0 last:pb-0 dark:border-white/10">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                        <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
                          <span className="font-medium text-black dark:text-white">{update.title}.</span> {update.description}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-7 border border-black/15 bg-black/[0.02] px-4 py-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-black/40 dark:text-white/40">{text.enSillaApiTitle}</p>
                    <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">{text.enSillaApiDescription}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <a href="https://germanrhenals.github.io/ensilla/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-black pb-1 text-xs font-medium uppercase tracking-wide transition-opacity hover:opacity-60 dark:border-white sm:text-sm">
                      {text.enSillaLive} ↗
                    </a>
                    <a href="https://github.com/GermanRhenals/ensilla" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border-b border-black/30 pb-1 text-xs font-medium uppercase tracking-wide text-black/60 transition-opacity hover:opacity-60 dark:border-white/30 dark:text-white/60 sm:text-sm">
                      {text.enSillaRepository} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ====== SECCIÓN 08: CONTACTO ====== */}
          <section id="contact" className="mx-auto max-w-6xl scroll-mt-20 border-t border-black/15 dark:border-white/10 py-16 pb-20 sm:py-20 sm:pb-24 md:py-28 md:pb-32 lg:py-32">
            {/* Fondo oscuro para contrastar con el resto del contenido */}
            <div className="bg-[#15181d] dark:bg-[#0a0e27] px-5 py-8 text-white sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-12">
              {/* Número y título de sección */}
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-white/50 dark:text-white/40 sm:mb-6">08 / Contact</p>
              
              {/* Título principal */}
              <h2 className="mb-4 text-2xl font-medium sm:mb-5 sm:text-3xl md:text-5xl lg:text-6xl">{text.contactTitle}</h2>
              
              {/* Descripción de contacto */}
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-white/75 dark:text-white/70 sm:mb-7 sm:text-lg md:text-xl">{text.contactText}</p>
              
              {/* CTA principal: Email y CV */}
              <div className="flex flex-wrap items-center gap-3 text-base sm:gap-4 sm:text-lg">
                {/* Email directo */}
                <a href="mailto:German35050@gmail.com" className="underline underline-offset-4 text-sm sm:text-base">German35050@gmail.com</a>
                {/* Botón para descargar CV */}
                <a href={`${import.meta.env.BASE_URL}German-Rhenals_cv.pdf`} download="German-Rhenals_cv.pdf" className="border border-white/50 dark:border-white/40 px-4 py-2 text-xs transition-colors hover:bg-white hover:text-[#15181d] dark:hover:bg-white/20 dark:hover:text-white sm:px-5 sm:py-2 sm:text-sm">{text.cv}</a>
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
