const WORK_CARD_TRANSITION_KEY = 'work-card-transition'
const WORK_CARD_RETURN_TRANSITION_KEY = 'work-card-return-transition'
const WORK_CARD_TRANSITION_TTL_MS = 5000

type WorkCardTransitionPayload = {
  workId: string
  timestamp: number
  rect: {
    top: number
    left: number
    width: number
    height: number
  }
  style: {
    borderRadius: string
    background: string
    border: string
    boxShadow: string
  }
}

export function captureWorkCardTransition(
  cardElement: HTMLElement,
  workId: string,
) {
  writePayloadToStorage(WORK_CARD_TRANSITION_KEY, cardElement, workId)
}

export function captureWorkCardReturnTransition(
  cardElement: HTMLElement,
  workId: string,
) {
  writePayloadToStorage(WORK_CARD_RETURN_TRANSITION_KEY, cardElement, workId)
}

function writePayloadToStorage(
  key: string,
  cardElement: HTMLElement,
  workId: string,
) {
  if (typeof window === 'undefined') {
    return
  }

  const rect = cardElement.getBoundingClientRect()

  if (rect.width < 2 || rect.height < 2) {
    return
  }

  const computed = window.getComputedStyle(cardElement)
  const payload: WorkCardTransitionPayload = {
    workId,
    timestamp: Date.now(),
    rect: {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    },
    style: {
      borderRadius: computed.borderRadius,
      background:
        computed.backgroundImage !== 'none'
          ? computed.backgroundImage
          : computed.backgroundColor,
      border: computed.border,
      boxShadow: computed.boxShadow,
    },
  }

  window.sessionStorage.setItem(key, JSON.stringify(payload))
}

export function consumeWorkCardTransition(
  workId: string,
): WorkCardTransitionPayload | null {
  return consumeWorkCardTransitionByKey(WORK_CARD_TRANSITION_KEY, workId)
}

function consumeWorkCardTransitionByKey(
  key: string,
  workId: string,
): WorkCardTransitionPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawPayload = window.sessionStorage.getItem(key)
  if (!rawPayload) {
    return null
  }

  window.sessionStorage.removeItem(key)

  try {
    const payload = JSON.parse(rawPayload) as WorkCardTransitionPayload
    const isFresh = Date.now() - payload.timestamp < WORK_CARD_TRANSITION_TTL_MS

    if (!isFresh || payload.workId !== workId) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function getWorkCardReturnTransition(): WorkCardTransitionPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawPayload = window.sessionStorage.getItem(WORK_CARD_RETURN_TRANSITION_KEY)
  if (!rawPayload) {
    return null
  }

  try {
    const payload = JSON.parse(rawPayload) as WorkCardTransitionPayload
    const isFresh = Date.now() - payload.timestamp < WORK_CARD_TRANSITION_TTL_MS

    if (!isFresh) {
      window.sessionStorage.removeItem(WORK_CARD_RETURN_TRANSITION_KEY)
      return null
    }

    return payload
  } catch {
    window.sessionStorage.removeItem(WORK_CARD_RETURN_TRANSITION_KEY)
    return null
  }
}

export function clearWorkCardReturnTransition() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(WORK_CARD_RETURN_TRANSITION_KEY)
}
