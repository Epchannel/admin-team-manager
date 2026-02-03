import { useState } from 'react';
import { X, FileJson, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    name: string;
    teamName: string;
    status: 'active' | 'inactive';
    accessToken?: string;
    accountId?: string;
  }) => void;
  isLoading?: boolean;
}

interface ParsedJsonData {
  user?: {
    id?: string;
    email?: string;
  };
  account?: {
    id?: string;
  };
  accessToken?: string;
}

const sampleJson = `{
  "user": {
    "id": "user-xxx",
    "email": "admin@example.com"
  },
  "account": {
    "id": "a9e39127-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIs..."
}`;

export function AddAdminModal({ isOpen, onClose, onSubmit, isLoading }: AddAdminModalProps) {
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedJsonData | null>(null);

  const parseJson = (json: string) => {
    try {
      const data = JSON.parse(json) as ParsedJsonData;
      if (!data.user?.email) {
        setError('JSON thiếu trường user.email');
        setParsedData(null);
        return;
      }
      if (!data.account?.id) {
        setError('JSON thiếu trường account.id');
        setParsedData(null);
        return;
      }
      if (!data.accessToken) {
        setError('JSON thiếu trường accessToken');
        setParsedData(null);
        return;
      }
      setError('');
      setParsedData(data);
    } catch (e) {
      setError('JSON không hợp lệ. Vui lòng kiểm tra lại.');
      setParsedData(null);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonData(value);
    if (value.trim()) {
      parseJson(value);
    } else {
      setParsedData(null);
      setError('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonData(content);
        parseJson(content);
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    setJsonData(sampleJson);
    setError('');
    setParsedData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedData) {
      setError('Vui lòng nhập JSON hợp lệ');
      return;
    }

    const email = parsedData.user!.email!;
    
    onSubmit({
      email: email,
      name: email.split('@')[0], // Auto-generate name from email
      teamName: '', // Will be fetched from API after creation
      status: 'active',
      accessToken: parsedData.accessToken,
      accountId: parsedData.account!.id,
    });

    // Reset form
    setJsonData('');
    setParsedData(null);
    setError('');
    onClose();
  };

  const handleClose = () => {
    setJsonData('');
    setParsedData(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileJson className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Add Admin Account</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full" type="button" asChild>
                    <span className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload JSON File
                    </span>
                  </Button>
                </label>
                <Button variant="outline" type="button" onClick={loadSample}>
                  Load Sample
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jsonInput">JSON Data (ChatGPT Session)</Label>
                <Textarea
                  id="jsonInput"
                  value={jsonData}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="Paste your ChatGPT session JSON here..."
                  className="font-mono text-sm h-48 resize-none"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              {parsedData && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 space-y-1">
                  <p className="text-sm text-green-400 font-medium">✓ JSON hợp lệ</p>
                  <p className="text-xs text-muted-foreground">Email: {parsedData.user?.email}</p>
                  <p className="text-xs text-muted-foreground">Account ID: {parsedData.account?.id}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                * Thông tin admin sẽ được tự động lấy từ API sau khi thêm thành công.
              </p>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!parsedData || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Account'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
