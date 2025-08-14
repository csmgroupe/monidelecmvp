import { Clock } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  date: string;
  status: 'pending' | 'completed';
}

export const ProjectCard = ({ title, date, status }: ProjectCardProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        status === 'completed'
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'completed' ? 'Terminé' : 'En cours'}
      </span>
    </div>
    <div className="flex items-center text-sm text-gray-500">
      <Clock className="w-4 h-4 mr-1" />
      {date}
    </div>
  </div>
);
