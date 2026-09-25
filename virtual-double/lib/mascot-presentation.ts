export type MascotMoment = 'normal' | 'completion' | 'step-transition' | 'check-in'

export interface MascotPresentation {
  src: string
  alt: string
}

export function getMascotPresentation(
  moment: MascotMoment,
  mascotName: string,
): MascotPresentation {
  if (moment === 'check-in') {
    return {
      src: '/ant-sad-removebg.png',
      alt: `${mascotName} checking in`,
    }
  }

  if (moment === 'completion' || moment === 'step-transition') {
    return {
      src: '/ant-happy-removebg.png',
      alt: `${mascotName} celebrating`,
    }
  }

  return {
    src: '/ant-mascot-removebg.png',
    alt: `${mascotName} companion`,
  }
}
