/**
 * Votación del nombre del próximo videojuego.
 *
 * Habla con la API REST de Supabase directamente, sin SDK: son dos llamadas y
 * no vale la pena sumar una dependencia al portafolio.
 *
 * La clave que aparece acá es la pública (`publishable`) del proyecto. No es un
 * secreto: RLS solo permite leer los conteos y votar por la RPC, que aplica su
 * propio enfriamiento por IP.
 */

const SUPABASE_URL = 'https://igfjcxduxxlxmworgldm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Qh5vHBJX4WkqqASvX0-Ylw_dR0uqheM'

/** Clave estable de cada opción; coincide con la tabla de Supabase. */
export type GameNameOption =
  | 'shadows-of-duty'
  | 'green-crossfire'
  | 'ghost-protocol'
  | 'memory-of-shadows'

/** Votos por opción. */
export type VoteCounts = Record<string, number>

type VoteRow = { option_key: string; votes: number }

export type VoteResult =
  | { ok: true; counts: VoteCounts }
  | { ok: false; reason: 'already' | 'error' }

function toCounts(rows: VoteRow[]): VoteCounts {
  const counts: VoteCounts = {}
  for (const row of rows) {
    counts[row.option_key] = row.votes
  }
  return counts
}

async function callRpc(
  name: string,
  body: Record<string, string>,
): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

/** Devuelve los conteos actuales. Lanza si la red o Supabase fallan. */
export async function fetchVoteCounts(): Promise<VoteCounts> {
  const response = await callRpc('get_game_name_votes', {})
  if (!response.ok) {
    throw new Error('No se pudieron cargar los votos.')
  }
  return toCounts((await response.json()) as VoteRow[])
}

/** Registra un voto y devuelve los conteos actualizados. */
export async function castVote(option: GameNameOption): Promise<VoteResult> {
  try {
    const response = await callRpc('vote_game_name', { p_option: option })
    if (!response.ok) {
      const detail = await response.text()
      return {
        ok: false,
        reason: detail.includes('ya votaste') ? 'already' : 'error',
      }
    }
    return { ok: true, counts: toCounts((await response.json()) as VoteRow[]) }
  } catch {
    return { ok: false, reason: 'error' }
  }
}
