/**
 * The partner wall as it shipped, used to seed the CMS.
 *
 * The live wall reads from Payload (see `getPartnerTiers()` in content.ts) —
 * this is the starting set that `scripts/seed.ts` uploads and writes on first
 * boot, paired with the logo files in public/assets/partners. Editing it after
 * that changes nothing on the site; the admin is where partners are managed.
 */
export type SeedPartner = {
  name: string
  file: string
  /** Per-logo cap so wordmarks and roundels sit at the same optical weight. */
  maxHeight: number
  maxWidth: number
  website?: string
}

export type SeedPartnerTier = {
  label: string
  /** Plaque min-width differs between the academic row and the rest. */
  minWidth: number
  partners: SeedPartner[]
}

export const partnerTiers: SeedPartnerTier[] = [
  {
    label: 'Academic',
    minWidth: 130,
    partners: [
      { name: 'ETF', file: 'etf.svg', maxHeight: 30, maxWidth: 150 },
      { name: 'MATF', file: 'matf.png', maxHeight: 34, maxWidth: 150 },
      { name: 'TMF', file: 'tmf.png', maxHeight: 38, maxWidth: 150 },
    ],
  },
  {
    label: 'Silver team',
    minWidth: 120,
    partners: [
      { name: 'Ansys', file: 'ansys.svg', maxHeight: 26, maxWidth: 130 },
      { name: 'Altium', file: 'altium.png', maxHeight: 26, maxWidth: 130 },
      { name: 'Würth', file: 'wurth.svg', maxHeight: 34, maxWidth: 130 },
      { name: '3D Republika', file: '3d-republika.png', maxHeight: 38, maxWidth: 130 },
      { name: 'Affinity', file: 'affinity.svg', maxHeight: 30, maxWidth: 130 },
      { name: 'OpenProject', file: 'openproject.svg', maxHeight: 26, maxWidth: 130 },
    ],
  },
  {
    label: 'Supporters',
    minWidth: 120,
    partners: [
      { name: 'ETF Robotics', file: 'etf-robotics.svg', maxHeight: 34, maxWidth: 130 },
      {
        name: 'Digital Serbia Initiative',
        file: 'digital-serbia-initiative.svg',
        maxHeight: 30,
        maxWidth: 130,
      },
      {
        name: 'European Space Foundation',
        file: 'european-space-foundation.svg',
        maxHeight: 34,
        maxWidth: 140,
      },
      { name: 'OeWF', file: 'oewf.png', maxHeight: 40, maxWidth: 130 },
      { name: 'ICRC', file: 'icrc.png', maxHeight: 40, maxWidth: 130 },
    ],
  },
  {
    label: 'Project sponsors',
    minWidth: 120,
    partners: [
      { name: 'PRDC', file: 'prdc.svg', maxHeight: 30, maxWidth: 130 },
      { name: 'TX Services', file: 'tx-services.png', maxHeight: 30, maxWidth: 130 },
      { name: 'Red Black Tree', file: 'red-black-tree.svg', maxHeight: 30, maxWidth: 130 },
      { name: 'Edepro', file: 'edepro.png', maxHeight: 34, maxWidth: 130 },
    ],
  },
]
