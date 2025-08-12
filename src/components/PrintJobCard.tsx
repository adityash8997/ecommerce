import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, Clock, DollarSign, Printer, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PrintJobCardProps {
  job: any;
  onAccept?: (jobId: string) => void;
  onStatusChange?: (jobId: string, status: string) => void;
  onDownload?: (filePath: string) => void;
  showActions?: boolean;
  isHelper?: boolean;
  isMyJob?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  accepted: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  printing: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  ready_for_pickup: 'bg-green-500/20 text-green-700 border-green-500/30',
  delivered: 'bg-green-600/20 text-green-800 border-green-600/30',
  completed: 'bg-gray-500/20 text-gray-700 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-700 border-red-500/30'
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  printing: 'Printing',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

export function PrintJobCard({ 
  job, 
  onAccept, 
  onStatusChange, 
  onDownload,
  showActions = true,
  isHelper = false,
  isMyJob = false
}: PrintJobCardProps) {
  const statusColor = statusColors[job.status as keyof typeof statusColors] || statusColors.pending;
  const statusLabel = statusLabels[job.status as keyof typeof statusLabels] || job.status;

  const renderCustomerActions = () => {
    if (!isMyJob) return null;

    return (
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" disabled>
          <Clock className="w-4 h-4 mr-2" />
          Waiting for Helper
        </Button>
      </div>
    );
  };

  const renderHelperActions = () => {
    if (!isHelper || !showActions) return null;

    if (job.status === 'pending') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => onAccept?.(job.id)}
            className="flex-1"
          >
            Accept Job
          </Button>
        </div>
      );
    }

    if (job.status === 'accepted') {
      return (
        <div className="flex gap-2 mt-4">
          {job.file_storage_path && (
            <Button 
              variant="outline" 
              onClick={() => onDownload?.(job.file_storage_path)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          )}
          <Button 
            onClick={() => onStatusChange?.(job.id, 'printing')}
          >
            Start Printing
          </Button>
        </div>
      );
    }

    if (job.status === 'printing') {
      return (
        <div className="flex gap-2 mt-4">
          {job.delivery_type === 'delivery' ? (
            <Button 
              onClick={() => onStatusChange?.(job.id, 'delivered')}
              className="flex-1"
            >
              Mark as Delivered
            </Button>
          ) : (
            <Button 
              onClick={() => onStatusChange?.(job.id, 'ready_for_pickup')}
              className="flex-1"
            >
              Ready for Pickup
            </Button>
          )}
        </div>
      );
    }

    if (job.status === 'ready_for_pickup' || job.status === 'delivered') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => onStatusChange?.(job.id, 'completed')}
            className="flex-1"
          >
            Mark as Completed
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="glassmorphism hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {job.file_name}
            </CardTitle>
            <CardDescription className="mt-1">
              Submitted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge className={statusColor}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-muted-foreground" />
            <span>{job.page_count} pages × {job.copies} copies</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold">₹{job.total_cost}</span>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>
              {job.delivery_type === 'delivery' 
                ? `Deliver to: ${job.delivery_location}` 
                : `Pickup from: ${job.pickup_location || 'Helper location'}`
              }
            </span>
          </div>
          <div className="text-muted-foreground">
            {job.print_type === 'black_white' ? 'Black & White' : 'Color'} • {job.paper_size}
            {job.binding_option && ` • ${job.binding_option}`}
          </div>
        </div>

        {/* Customer Info (for helpers) */}
        {isHelper && (
          <div className="bg-muted/30 p-3 rounded-lg text-sm">
            <p><strong>Customer:</strong> {job.student_name}</p>
            <p><strong>Contact:</strong> {job.student_contact}</p>
            {job.additional_notes && (
              <p><strong>Notes:</strong> {job.additional_notes}</p>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        {job.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">⚠️ Privacy Notice</p>
            <p>Please do not share confidential documents. Files are only accessible to assigned helpers.</p>
          </div>
        )}

        {/* Action Buttons */}
        {renderCustomerActions()}
        {renderHelperActions()}
      </CardContent>
    </Card>
  );
}