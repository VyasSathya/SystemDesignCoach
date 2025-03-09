import dynamic from 'next/dynamic';

const SimpleFlow = dynamic(() => import('../components/SimpleFlow'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  )
});

export default function TestPage() {
  return (
    <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
      <h1 className="text-2xl font-bold mb-4">React Flow Test Page</h1>
      <div style={{ width: '100%', height: 'calc(100vh - 100px)', border: '1px solid #ccc' }}>
        <SimpleFlow />
      </div>
    </div>
  );
}