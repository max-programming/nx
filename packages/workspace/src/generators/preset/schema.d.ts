import { Preset } from '../utils/presets';
import { PackageManager } from '@nx/devkit';

export interface Schema {
  name: string;
  npmScope?: string;
  style?: string;
  linter?: string;
  preset: Preset;
  standaloneConfig?: boolean;
  framework?: string;
  packageManager?: PackageManager;
  bundler?: 'vite' | 'webpack' | 'rspack';
  docker?: boolean;
  nextAppDir?: boolean;
  routing?: boolean;
  standaloneApi?: boolean;
  e2eTestRunner?: 'cypress' | 'jest' | 'detox' | 'none';
}
