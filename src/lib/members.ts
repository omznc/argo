/**
 * The bands of the members page, used to seed the CMS.
 *
 * Roles only, and deliberately no people: everything else this repo seeds is
 * authored copy about the laboratory, but a member is a named student. Shipping
 * invented ones would put fabricated names on a real team's public page for as
 * long as it took someone to notice — a worse first-boot state than an empty
 * roster, which the page says plainly.
 *
 * So this gives an editor the structure to fill: open Members in the admin,
 * pick a role, add a photo. Editing this file after the first seed changes
 * nothing on the site.
 */
export type SeedMemberRole = {
  label: string
  blurb?: string
}

export const memberRoles: SeedMemberRole[] = [
  { label: 'Leadership', blurb: 'Direction, funding and everything nobody else wants to own.' },
  { label: 'Mechanical', blurb: 'Structures, drivetrain, manipulators.' },
  { label: 'Electrical', blurb: 'Power, boards and the harness that ties a vehicle together.' },
  { label: 'Software', blurb: 'Firmware, autonomy, ground control.' },
  { label: 'Outreach', blurb: 'Workshops, exhibits and the people who keep the lights on.' },
]
