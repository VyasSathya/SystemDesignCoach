import { Users, Network, Server, Database, Shield, Plus } from 'lucide-react';

export const iconMap = {
  'Users': Users,
  'Network': Network,
  'Server': Server,
  'Database': Database,
  'Shield': Shield,
  'Plus': Plus
};

export const getIconComponent = (iconName) => {
  return iconMap[iconName] || Server; // Default to Server if icon not found
};