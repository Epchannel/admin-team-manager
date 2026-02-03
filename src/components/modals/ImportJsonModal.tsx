import { useState } from 'react';
import { X, FileJson, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonData: string) => void;
}

const sampleJson = `[
  {
    "email": "admin@example.com",
    "name": "Sample Admin",
    "teamName": "Sample Team",
    "status": "active",
    "members": [
      {
        "email": "member1@example.com",
        "name": "Member 1",
        "role": "member"
      }
    ]
  }
]`;

export function ImportJsonModal({ isOpen, onClose, onImport }: ImportJsonModalProps) {
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    try {
      JSON.parse(jsonData);
      setError('');
      onImport(jsonData);
      setJsonData('');
      onClose();
    } catch (e) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonData(content);
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    setJsonData(sampleJson);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 w-full max-w-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileJson className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Import from JSON</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload JSON File
                    </span>
                  </Button>
                </label>
                <Button variant="outline" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonInput">JSON Data</Label>
                <Textarea
                  id="jsonInput"
                  value={jsonData}
                  onChange={(e) => {
                    setJsonData(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste your JSON data here..."
                  className="font-mono text-sm h-64 resize-none"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  className="flex-1"
                  disabled={!jsonData.trim()}
                >
                  Import Accounts
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
