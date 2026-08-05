import * as migration_20260805_133632_initial from './20260805_133632_initial';
import * as migration_20260805_171537_add_post_lede from './20260805_171537_add_post_lede';
import * as migration_20260805_191232_add_settings_partners_forms from './20260805_191232_add_settings_partners_forms';
import * as migration_20260805_192452_reading_minutes_derived from './20260805_192452_reading_minutes_derived';
import * as migration_20260805_192906_add_members from './20260805_192906_add_members';

export const migrations = [
  {
    up: migration_20260805_133632_initial.up,
    down: migration_20260805_133632_initial.down,
    name: '20260805_133632_initial',
  },
  {
    up: migration_20260805_171537_add_post_lede.up,
    down: migration_20260805_171537_add_post_lede.down,
    name: '20260805_171537_add_post_lede',
  },
  {
    up: migration_20260805_191232_add_settings_partners_forms.up,
    down: migration_20260805_191232_add_settings_partners_forms.down,
    name: '20260805_191232_add_settings_partners_forms',
  },
  {
    up: migration_20260805_192452_reading_minutes_derived.up,
    down: migration_20260805_192452_reading_minutes_derived.down,
    name: '20260805_192452_reading_minutes_derived',
  },
  {
    up: migration_20260805_192906_add_members.up,
    down: migration_20260805_192906_add_members.down,
    name: '20260805_192906_add_members'
  },
];
