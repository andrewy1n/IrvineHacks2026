import { useEffect, useState, useRef } from 'react';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { NodeDetails } from '@/components/NodeDetails';
import { DevToolbar } from '@/components/DevToolbar';
import { UploadScreen } from '@/components/UploadScreen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Brain, Loader2 } from 'lucide-react';
import { startMockSocket, stopMockSocket } from '@/services/mockSocket';
import { useGraphStore } from '@/store/graphStore';

export default function App() {
  const [studyGoal, setStudyGoal] = useState('Deep Learning Fundamentals');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphData = useGraphStore((s) => s.graphData);
  const setGraphData = useGraphStore((s) => s.setGraphData);

  useEffect(() => {
    startMockSocket();
    return () => stopMockSocket();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      console.error('PDF upload error:', err);
      alert(err instanceof Error ? err.message : 'Failed to process PDF. Check the console for details.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-3 bg-white/80 backdrop-blur-sm z-10 relative shadow-sm">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 shrink-0 text-blue-500" />
          <span className="font-semibold text-sm tracking-tight text-gray-800">KG Mastery</span>
        </div>
        {graphData && (
          <>
            <div className="h-4 w-px bg-border mx-2" />
            <Input
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              placeholder="What are we learning today?"
              className="max-w-md h-9 text-sm bg-gray-50 border-gray-200"
            />
            <div className="ml-auto flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploading ? 'Analyzing PDF...' : 'Upload PDF'}
              </Button>
            </div>
          </>
        )}
      </div>

      {graphData ? (
        <>
          {/* Dev Toolbar */}
          <div className="z-10 relative">
            <DevToolbar />
          </div>

          {/* Graph + Details overlay */}
          <div className="relative flex-1 min-h-0 bg-gray-50">
            <KnowledgeGraph />

            {/* We keep NodeDetails floating at the bottom or side */}
            <div className="absolute bottom-4 right-4 w-80 z-20 pointer-events-none">
              <div className="pointer-events-auto">
                <NodeDetails />
              </div>
            </div>
          </div>
        </>
      ) : (
        <UploadScreen isUploading={isUploading} onUpload={handleFileUpload} />
      )}
    </div>
  );
}
