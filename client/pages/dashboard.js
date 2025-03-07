import MetricCard from '../components/MetricCard';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  return (
    <div>
      <Sidebar />
      <h1>Dashboard</h1>
      <MetricCard />
    </div>
  );
}