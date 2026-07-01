import fs from 'fs';
import path from 'path';
import os from 'os';
import { version } from '../../package.json';
import { select } from '../prompts';

type BluprintProfile = {
  /** Git URL (or shorthand) or local directory path (file://...) to a bluprint */
  url: string;
  /** Category bluprint is grouped under in the CLI */
  category: string;
  /** Name of the bluprint */
  title: string;
  /** Some hint text shown in the prompt */
  hint?: string;
};

export type UserProfile = {
  /** Semver version of the bluprint CLI installed */
  version: string;
  /** GitHub authorization token */
  token: string;
  /** Installed bluprints */
  bluprints: Record<string, BluprintProfile>;
};

export const userProfilePath = path.join(
  os.homedir(),
  `.bluprint/profile.json`
);

const defaultUserProfile: UserProfile = {
  version,
  token: '',
  bluprints: {},
};

class Profile {
  private static instance: Profile;
  public static getInstance(): Profile {
    if (!Profile.instance) Profile.instance = new Profile();
    return Profile.instance;
  }

  private readUserProfile() {
    if (!fs.existsSync(userProfilePath)) {
      this.writeUserProfile(defaultUserProfile);
      return defaultUserProfile;
    }
    const userProfile = JSON.parse(
      fs.readFileSync(userProfilePath, 'utf-8')
    ) as UserProfile;

    // Update version
    if (version !== userProfile.version) {
      userProfile.version = version;
      fs.writeFileSync(userProfilePath, JSON.stringify(userProfile));
    }

    return userProfile;
  }

  private writeUserProfile(data: UserProfile) {
    if (!fs.existsSync(path.dirname(userProfilePath)))
      fs.mkdirSync(path.dirname(userProfilePath), { recursive: true });
    fs.writeFileSync(userProfilePath, JSON.stringify(data));
  }

  get token() {
    const { token } = this.readUserProfile();
    return token;
  }

  set token(token: string) {
    const profile = this.readUserProfile();
    profile.token = token;
    this.writeUserProfile(profile);
  }

  addBluprint(bluprintProfile: BluprintProfile) {
    const profile = this.readUserProfile();
    profile.bluprints[bluprintProfile.title] = bluprintProfile;
    this.writeUserProfile(profile);
  }

  removeBluprint(title: string) {
    const profile = this.readUserProfile();
    if (profile.bluprints[title]) delete profile.bluprints[title];
    this.writeUserProfile(profile);
  }

  private getBluprintOptions() {
    const profile = this.readUserProfile();
    const keys = Object.keys(profile.bluprints);
    return keys.map((key) => ({
      value: profile.bluprints[key].url,
      label: profile.bluprints[key].title,
      hint: profile.bluprints[key].hint,
    }));
  }

  async promptForBluprint() {
    return select({
      message: 'Which bluprint would you to start your project from?',
      options: this.getBluprintOptions(),
    });
  }

  /** Titles of all installed bluprints, sorted alphabetically. */
  get bluprintTitles(): string[] {
    return Object.keys(this.readUserProfile().bluprints).sort();
  }

  /** Resolve an installed bluprint's URL by its title, if registered. */
  getBluprintUrl(title: string): string | undefined {
    return this.readUserProfile().bluprints[title]?.url;
  }

  /**
   * Prompt the user to choose an installed bluprint by title, e.g. to remove it.
   * @returns The chosen bluprint's title (its key in the profile).
   */
  async promptForBluprintToRemove(): Promise<string> {
    const profile = this.readUserProfile();
    return select({
      message: 'Which bluprint do you want to remove?',
      options: this.bluprintTitles.map((title) => ({
        value: title,
        label: profile.bluprints[title].title,
        hint: profile.bluprints[title].category,
      })),
    });
  }
}

export const profile = Profile.getInstance();
