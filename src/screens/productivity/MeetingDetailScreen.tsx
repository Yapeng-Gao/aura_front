import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

export const MeetingDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{meeting?.title}</h1>
        <div className="space-x-4">
          <Button 
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => navigate(`/assistant/meeting-ai/${meetingId}`)}
          >
            打开AI分析
          </Button>
          {/* ... existing buttons ... */}
        </div>
      </div>
      
      {/* ... existing content ... */}
    </div>
  );
}; 