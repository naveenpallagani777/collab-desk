export interface InviteTokenPayload {
  invitationId: string
  workspaceId: string
  email: string
  role: string
}

function normalizeBase64(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4
  if (padding === 0) return base64
  return `${base64}${'='.repeat(4 - padding)}`
}

export function decodeInviteToken(token?: string | null): InviteTokenPayload | null {
  if (!token) return null

  try {
    const raw = atob(normalizeBase64(token))
    const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json) as Partial<InviteTokenPayload>

    if (!parsed.invitationId || !parsed.workspaceId || !parsed.email || !parsed.role) {
      return null
    }

    return {
      invitationId: parsed.invitationId,
      workspaceId: parsed.workspaceId,
      email: parsed.email,
      role: parsed.role,
    }
  } catch {
    return null
  }
}
