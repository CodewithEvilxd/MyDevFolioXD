import { GitHubUser, Repository } from '@/types';
import ProfileHeader from './ProfileHeader';
import PinnedRepos from '../projects/PinnedRepos';
import RepoStats from '../projects/RepoStats';
import ActivityGraph from '../visualizations/ActivityGraph';
import CommitHistory from '../visualizations/CommitHistory';

interface ProfileDisplayProps {
  user: GitHubUser;
  repos: Repository[];
  loading: boolean;
  token: string | null;
}

export default function ProfileDisplay({
  user,
  repos,
  loading,
  token,
}: ProfileDisplayProps) {
  return (
    <div className='space-y-6'>
      <ProfileHeader user={user} />

      <PinnedRepos username={user.login} repos={repos} token={token} />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        <RepoStats repos={repos} />
        <ActivityGraph username={user.login} token={token} />
      </div>

      <CommitHistory repos={repos} username={user.login} token={token} />
    </div>
  );
}
