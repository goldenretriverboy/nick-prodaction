export const routes = {
  home: '/',
  works: '/works',
  workDetailsPattern: '/works/:workId',
  workDetails: (workId: string) => `/works/${workId}`,
  privacy: '/privacy',
  offer: '/offer',
} as const
