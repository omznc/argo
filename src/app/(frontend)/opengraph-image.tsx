import { ogCard, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Argo — Student Space Research Laboratory'
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return ogCard({
    eyebrow: 'Student Space Research Laboratory',
    title: 'Building next-gen rovers and rockets.',
    footer: 'Belgrade · University of Belgrade',
  })
}
