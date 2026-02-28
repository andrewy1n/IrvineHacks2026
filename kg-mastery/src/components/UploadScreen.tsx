import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadScreenProps {
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadScreen({ isUploading, onUpload }: UploadScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-200"
      >
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Upload Course Material</h2>
          <p className="text-sm text-gray-500">
            Upload a syllabus, lecture slides, or reading material (PDF) to generate a customized knowledge graph.
          </p>
        </div>

        <div className="pt-4">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={onUpload}
          />
          <Button 
            size="lg" 
            className="w-full h-12 text-sm font-medium gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing PDF & Building Graph...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Select PDF File
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
