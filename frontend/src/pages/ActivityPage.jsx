import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserActivity } from '../features/activity/activitySlice';
import ActivityTimeline from '../components/timeline/ActivityTimeline';
import { PageLoader } from '../components/ui/Spinner';
import { Activity } from 'lucide-react';

const ActivityPage = () => {
  const dispatch = useDispatch();
  const { logs, isLoading, total } = useSelector((s) => s.activity);

  useEffect(() => { dispatch(fetchUserActivity()); }, [dispatch]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Activity size={24} className="text-primary-400" /> Activity Feed
          </h1>
          <p className="text-gray-400 text-sm mt-1">{total} total actions</p>
        </div>
      </div>
      <div className="card max-w-2xl">
        {isLoading && logs.length === 0 ? <PageLoader /> : <ActivityTimeline logs={logs} isLoading={isLoading} />}
      </div>
    </div>
  );
};

export default ActivityPage;
