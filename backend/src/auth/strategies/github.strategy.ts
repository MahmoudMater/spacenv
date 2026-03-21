import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

type GitHubProfile = {
  id: string | number;
  displayName?: string;
  username?: string;
  emails?: { value: string; primary?: boolean }[];
  photos?: { value: string }[];
};

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID') ?? 'unset-github-client-id',
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') ?? 'unset',
      callbackURL: config.get<string>(
        'GITHUB_CALLBACK_URL',
        'http://localhost:4000/api/v1/auth/github/callback',
      ),
      scope: ['user:email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GitHubProfile,
    done: (err: Error | null, user?: unknown) => void,
  ) {
    const email =
      profile.emails?.find((e) => e.primary)?.value ??
      profile.emails?.[0]?.value;
    if (!email) {
      return done(new Error('GitHub account has no public email'), false);
    }
    const user = {
      email,
      name: profile.displayName ?? profile.username ?? email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      provider: 'github',
      providerId: String(profile.id),
    };
    done(null, user);
  }
}
