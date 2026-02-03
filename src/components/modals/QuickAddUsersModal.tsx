import { useState } from 'react';
import { Users, Zap, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import * as api from '@/lib/api';

interface QuickAddUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickAddUsersModal({ isOpen, onClose, onSuccess }: QuickAddUsersModalProps) {
  const [emailsText, setEmailsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<api.AutoAddResult | null>(null);

  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const handleSubmit = async () => {
    const emails = parseEmails(emailsText);
    
    if (emails.length === 0) {
      toast.error('Vui lòng nhập ít nhất 1 email hợp lệ');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await api.autoAddUsers(emails);
      setResult(response);
      
      if (response.success && response.summary.successCount > 0) {
        toast.success(`Đã phân bổ ${response.summary.successCount}/${response.summary.totalRequested} users thành công!`);
        onSuccess();
      } else if (response.summary.failedCount > 0) {
        toast.warning(`Có ${response.summary.failedCount} emails không thể thêm`);
      }
    } catch (error) {
      toast.error('Lỗi khi gọi API auto-add');
      console.error('Auto-add error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmailsText('');
    setResult(null);
    onClose();
  };

  const parsedEmails = parseEmails(emailsText);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Thêm User Nhanh
          </DialogTitle>
          <DialogDescription>
            Tự động phân bổ users vào các team có slot trống. Ưu tiên fill đầy team cũ trước.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Danh sách emails (mỗi dòng 1 email hoặc phân cách bằng dấu phẩy)
            </label>
            <Textarea
              placeholder="user1@gmail.com&#10;user2@gmail.com&#10;user3@gmail.com"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              rows={6}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {parsedEmails.length} email(s) hợp lệ được phát hiện
            </p>
          </div>

          {/* Results display */}
          {result && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Tổng:</span>
                  <span>{result.summary.totalRequested}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{result.summary.successCount} thành công</span>
                </div>
                {result.summary.failedCount > 0 && (
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{result.summary.failedCount} thất bại</span>
                  </div>
                )}
              </div>

              {/* Success assignments */}
              {result.results.assignments && result.results.assignments.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Phân bổ thành công:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.results.assignments.map((item, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-2 p-1.5 rounded bg-green-500/10">
                        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                        <span className="truncate">{item.email}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium truncate">{item.teamName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed items */}
              {result.results.failed && result.results.failed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Không thể thêm:</p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {result.results.failed.map((item, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-2 p-1.5 rounded bg-destructive/10">
                        <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                        <span className="truncate">{item.email}</span>
                        <span className="text-muted-foreground">- {item.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {result ? 'Đóng' : 'Hủy'}
          </Button>
          {!result && (
            <Button onClick={handleSubmit} disabled={isLoading || parsedEmails.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Thêm {parsedEmails.length} user(s)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
