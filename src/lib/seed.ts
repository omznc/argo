import type { Project } from './content-types'

/**
 * Editorial copy lifted from the "Argo Site v2" design doc, and the input to
 * `scripts/seed.ts` — which writes it into Payload as published documents.
 *
 * Nothing on the site reads this module any more: pages go through
 * `src/lib/content.ts`, which queries the CMS. It is kept because a fresh
 * database still needs content to start from, and because this copy is the
 * only record of the design's intended voice.
 *
 * Post bodies are written as blocks here and converted to Lexical by the seed
 * script — editors work in rich text from that point on, so this shape is a
 * seed format rather than a content model.
 */

export type SeedProject = Omit<Project, 'heroImage'>

export type SeedPostBlock =
  | { type: 'lede'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }

export type SeedPost = {
  slug: string
  title: string
  category: 'Engineering' | 'Team' | 'Outreach' | 'Competition'
  author: string
  publishedAt: string
  excerpt: string
  heroCaption: string
  body: SeedPostBlock[]
  tags: string[]
}

export const projects: SeedProject[] = [
  {
    slug: 'rover-25',
    title: "Rover '25",
    status: 'active',
    cycle: '2025–2026',
    cycleShort: '25–26',
    target: 'ERC 2026',
    domain: 'rover',
    excerpt:
      'All-terrain drivetrain, robotic arm, autonomous navigation and a robust comms system. Targets ERC 2026 for field testing.',
    lede: 'Our next-generation rover: an all-terrain drivetrain, a robotic arm, autonomous navigation and a robust comms system, built for field testing and competition readiness at the European Rover Challenge 2026.',
    body: [
      "Rover '25 is a full redesign of the platform Argo fielded at ERC 2024. The focus this cycle is autonomy and reliability: a rebuilt drivetrain for rough terrain, a lighter arm with more reach, and a comms stack that holds a link at range.",
      'Subsystems are developed in parallel by student teams across electrical, mechanical and software engineering, then integrated and tested against the ERC task set.',
    ],
    subsystems: [
      { name: 'drivetrain', summary: 'All-terrain, rocker-based suspension for uneven ground.' },
      { name: 'arm', summary: 'Robotic manipulator for the ERC maintenance and collection tasks.' },
      {
        name: 'autonomy',
        summary: 'Waypoint navigation with obstacle avoidance for the autonomous run.',
      },
      { name: 'comms', summary: 'Long-range link with telemetry and video back to ground control.' },
    ],
    tags: ['autonomy', 'drivetrain', 'comms'],
    heroCaption: "image — rover '25 field test",
  },
  {
    slug: 'excalibur-rocket',
    title: 'Excalibur Rocket',
    status: 'active',
    cycle: '2025–2026',
    cycleShort: '25–26',
    target: '4 km apogee',
    domain: 'rocket',
    excerpt:
      'Experimental sounding rocket aiming for 4 km apogee, with a recovery system and custom avionics stack. First of its kind in the Western Balkans.',
    lede: 'An experimental sounding rocket aiming for a 4 km apogee, carrying a recovery system and a custom avionics stack — the first of its kind in the Western Balkans.',
    body: [
      'Excalibur is Argo’s first large-scale rocket programme. The airframe, recovery system and avionics are developed in-house, with the Hyrax flight computer handling telemetry and deployment on the way up and back down.',
      'The build cycle runs bench validation first, then static fire and staged flight tests, before the full-altitude attempt.',
    ],
    subsystems: [
      { name: 'airframe', summary: 'Composite body sized for a 4 km apogee flight profile.' },
      { name: 'recovery', summary: 'Dual-deploy parachute system triggered by onboard avionics.' },
      { name: 'avionics', summary: 'Hyrax flight computer logging telemetry and firing charges.' },
      { name: 'propulsion', summary: 'Solid motor characterised on the test stand before flight.' },
    ],
    tags: ['rocketry', 'recovery', 'avionics'],
    heroCaption: 'image — excalibur airframe integration',
  },
  {
    slug: 'hyrax',
    title: 'Hyrax',
    status: 'active',
    cycle: '2025–2026',
    cycleShort: '25–26',
    target: 'Excalibur first flight',
    domain: 'avionics',
    excerpt:
      'A dedicated avionics / flight computer for all medium and large vehicles — built because no affordable COTS board fit the requirements.',
    lede: 'A dedicated flight computer for every medium and large Argo vehicle — designed in-house because no affordable off-the-shelf board carried the interfaces we needed.',
    body: [
      'Hyrax is a single board meant to be shared across projects rather than rebuilt for each one. It carries the sensor suite, connectors and firmware the team actually uses, and spares sit on the shelf instead of on a lead time.',
      'The board is validated on the bench and flies first on Excalibur, where it handles the recovery system and telemetry.',
    ],
    subsystems: [
      { name: 'sensing', summary: 'IMU, barometer and GNSS on one board with a shared time base.' },
      { name: 'firmware', summary: 'Flight state machine with logging and in-field reconfiguration.' },
      { name: 'telemetry', summary: 'Downlink sized for live ground-station monitoring.' },
      { name: 'power', summary: 'Redundant rails so a single failure does not end a flight.' },
    ],
    tags: ['avionics', 'hyrax', 'excalibur'],
    heroCaption: 'image — hyrax board bring-up',
  },
  {
    slug: 'sojourner-exhibit',
    title: 'Sojourner Exhibit',
    status: 'shipped',
    cycle: '2025',
    cycleShort: '2025',
    domain: 'outreach',
    excerpt:
      'A full-scale Sojourner replica built for public exhibition, putting planetary robotics in front of a general audience.',
    lede: 'A full-scale Sojourner replica built for public exhibition, putting planetary robotics in front of a general audience.',
    body: [
      'The exhibit was built to travel: robust enough for public handling, light enough to move between venues, and accurate enough to teach from.',
    ],
    subsystems: [
      { name: 'chassis', summary: 'Rocker-bogie replica sized to the original rover.' },
      { name: 'exhibit', summary: 'Interpretive panels and a demo loop for visitors.' },
    ],
    tags: ['outreach', 'exhibit'],
    heroCaption: 'image — sojourner replica on display',
  },
  {
    slug: 'rover-24',
    title: "Rover '24",
    status: 'shipped',
    cycle: '2023–2024',
    cycleShort: '23–24',
    target: 'ERC 2024',
    domain: 'rover',
    excerpt:
      "The platform Argo fielded at ERC 2024, and the baseline every Rover '25 subsystem was measured against.",
    lede: "The platform Argo fielded at ERC 2024, and the baseline every Rover '25 subsystem was measured against.",
    body: [
      'The first Argo rover to run a full competition task set. What it taught the team about terrain handling and link budget drove the redesign that followed.',
    ],
    subsystems: [
      { name: 'drivetrain', summary: 'Six-wheel platform tested against the ERC course.' },
      { name: 'arm', summary: 'First-generation manipulator for the maintenance task.' },
    ],
    tags: ['rover', 'erc'],
    heroCaption: "image — rover '24 at ERC",
  },
  {
    slug: 'mdcs-workshop',
    title: 'MDCS Workshop',
    status: 'shipped',
    cycle: '2023–2024',
    cycleShort: '23–24',
    domain: 'outreach',
    excerpt:
      'A hands-on workshop series introducing students to motion, dynamics and control systems through real hardware.',
    lede: 'A hands-on workshop series introducing students to motion, dynamics and control systems through real hardware.',
    body: [
      'Run for students across the University of Belgrade, the series paired short lectures with bench work so participants left having tuned a real controller.',
    ],
    subsystems: [
      { name: 'curriculum', summary: 'Control theory taught against hardware, not slides.' },
      { name: 'benches', summary: 'Reusable rigs built for repeat sessions.' },
    ],
    tags: ['outreach', 'control'],
    heroCaption: 'image — MDCS workshop session',
  },
  {
    slug: 'zephyr-uav',
    title: 'Zephyr UAV',
    status: 'shipped',
    cycle: '2023–2024',
    cycleShort: '23–24',
    domain: 'uav',
    excerpt:
      'A fixed-wing UAV built to prove out Argo’s avionics and telemetry work before it moved to larger vehicles.',
    lede: 'A fixed-wing UAV built to prove out Argo’s avionics and telemetry work before it moved to larger vehicles.',
    body: [
      'Zephyr was the testbed where the team first flew its own flight software. Much of what it proved carried directly into Hyrax.',
    ],
    subsystems: [
      { name: 'airframe', summary: 'Fixed-wing platform sized for repeated test flights.' },
      { name: 'avionics', summary: 'Early flight stack that became the basis for Hyrax.' },
    ],
    tags: ['uav', 'avionics'],
    heroCaption: 'image — zephyr on the flight line',
  },
]

export const posts: SeedPost[] = [
  {
    slug: 'designing-hyrax',
    title: 'Designing Hyrax, an in-house flight computer',
    category: 'Engineering',
    author: 'Argo Avionics',
    publishedAt: '2026-03-12',
    excerpt:
      'No affordable off-the-shelf avionics board fit what Argo’s medium and large vehicles needed. So the team built its own.',
    heroCaption: 'image — hyrax board bring-up',
    body: [
      {
        type: 'lede',
        text: 'No affordable off-the-shelf avionics board fit what Argo’s medium and large vehicles needed. So the team built its own: Hyrax, a flight computer meant to be shared across projects rather than rebuilt for each one.',
      },
      { type: 'heading', text: 'why in-house' },
      {
        type: 'paragraph',
        text: 'Commercial flight computers either cost more than a student budget allows or leave out the interfaces our rockets and rovers rely on. Building the board in-house lets the team control the sensor suite, the connectors and the firmware, and keep spares on the shelf.',
      },
      {
        type: 'quote',
        text: 'One board across every medium and large vehicle — designed once, flown many times.',
      },
      { type: 'heading', text: "what's next" },
      {
        type: 'paragraph',
        text: 'Hyrax is being validated on the bench and will fly first on Excalibur, where it handles the recovery system and telemetry on the way to a 4 km apogee. The same board is planned for future rover and UAV builds.',
      },
    ],
    tags: ['avionics', 'hyrax', 'excalibur'],
  },
  {
    slug: 'rebuilding-the-drivetrain',
    title: "Rebuilding the drivetrain for Rover '25",
    category: 'Engineering',
    author: 'Argo Mechanical',
    publishedAt: '2026-01-28',
    excerpt:
      'What ERC 2024 taught us about rough terrain, and how that rewrote the suspension for the next rover.',
    heroCaption: 'image — drivetrain test rig',
    body: [
      {
        type: 'lede',
        text: 'ERC 2024 was the first time an Argo rover ran a full competition task set on real terrain. The drivetrain survived it — but not comfortably, and the notes from that week set the agenda for the redesign.',
      },
      { type: 'heading', text: 'what broke' },
      {
        type: 'paragraph',
        text: 'The failures were not dramatic. They were slow: wheels losing contact on loose slopes, motors drawing more current than the model predicted, and a chassis that transmitted every rock straight into the payload deck.',
      },
      {
        type: 'quote',
        text: 'Design for the terrain you measured, not the terrain you modelled.',
      },
      { type: 'heading', text: 'the rebuild' },
      {
        type: 'paragraph',
        text: 'The new rocker-based suspension keeps all six wheels loaded across the slopes we actually saw, and the deck is isolated from the worst of the shock. Bench testing now runs against terrain profiles recorded at the competition rather than idealised ramps.',
      },
    ],
    tags: ['drivetrain', 'rover', 'erc'],
  },
  {
    slug: 'why-we-compete',
    title: 'Why a student team belongs at the European Rover Challenge',
    category: 'Team',
    author: 'Argo',
    publishedAt: '2025-11-04',
    excerpt:
      'Competition is not the point — it is the deadline that makes the engineering real, and the room where the work gets judged.',
    heroCaption: 'image — the team at ERC',
    body: [
      {
        type: 'lede',
        text: 'People ask why a student laboratory spends a year building toward one week in Poland. The honest answer is that the competition is the only deadline that cannot move.',
      },
      { type: 'heading', text: 'a real deadline' },
      {
        type: 'paragraph',
        text: 'A university project can always slip a semester. A competition date cannot. That constraint is what turns a set of promising subsystems into an integrated vehicle that has to drive, grip and navigate on a specific morning.',
      },
      {
        type: 'quote',
        text: 'The rover either drives on the day, or it does not. Nothing else counts.',
      },
      { type: 'heading', text: 'and a room full of peers' },
      {
        type: 'paragraph',
        text: 'ERC also puts the work in front of teams solving the same problems with different answers. A week of that is worth a term of reading, and it is where most of our best ideas for the next cycle come from.',
      },
    ],
    tags: ['team', 'erc', 'outreach'],
  },
]
