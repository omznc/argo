/**
 * Replaces Payload's own wordmark on the login screen and the admin nav.
 * Server components — they render into the admin's own root layout, which has
 * nothing to do with the frontend's Tailwind layer.
 */
export function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/argo-lockup-white.svg" alt="Argo Robotics" style={{ height: 42, width: 'auto' }} />
  )
}
