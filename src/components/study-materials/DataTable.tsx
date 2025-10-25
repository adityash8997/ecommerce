// DataTable.tsx - Fixed to show all available columns
import React, { useState } from "react";
import { Eye, Download, Loader2, Presentation } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch?: string;
  year?: string;
  type?: 'note' | 'pyq' | 'ppt' | 'ebook';
  views: number;
  uploadedBy: string;
  uploadDate?: string;
  pdf_url: string;
}

interface DataTableProps {
  materials: StudyMaterialItem[];
  onViewPDF?: (id: number) => void;
  loading?: boolean;
  materialType?: "notes" | "pyqs" | "ppts" | "ebooks";
  onDownload?: (material: StudyMaterialItem) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  materials, 
  onViewPDF,
  materialType = "notes",
  onDownload
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = () => {
    switch (materialType) {
      case "ppts":
        return <Presentation className="w-4 h-4 text-orange-600" />;
      case "pyqs":
        return <Eye className="w-4 h-4 text-blue-600" />;
      case "ebooks":
        return <Eye className="w-4 h-4 text-indigo-600" />;
      default:
        return <Eye className="w-4 h-4 text-green-600" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (materialType) {
      case "ppts":
        return "PPT";
      case "pyqs":
        return "PYQ";
      case "ebooks":
        return "E-Book";
      default:
        return "Note";
    }
  };

  // ✅ Check if any material has branch or year data
  const hasBranchData = materials.some(m => m.branch);
  const hasYearData = materials.some(m => m.year);
  const hasViewsData = materials.some(m => m.views !== undefined);

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          {getFileIcon()}
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No {materialType} found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Semester</TableHead>
              {/* ✅ Show branch column if ANY material has branch data */}
              {hasBranchData && <TableHead className="font-semibold">Branch</TableHead>}
              {/* ✅ Show year column if ANY material has year data */}
              {hasYearData && <TableHead className="font-semibold">Year</TableHead>}
              {/* ✅ Show views column if data exists */}
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getFileIcon()}
                    <span className="truncate max-w-xs">{material.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {material.subject}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {material.semester}
                  </span>
                </TableCell>
                {/* ✅ Show branch cell if column exists */}
                {hasBranchData && (
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {material.branch || "N/A"}
                    </span>
                  </TableCell>
                )}

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {material.year || "N/A"}
                    </span>
                  </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        console.log('DataTable: View clicked', material.id);
                        if (onViewPDF) {
                          onViewPDF(material.id);
                        } else if (material.pdf_url) {
                          // Fallback: open the file directly
                          window.open(material.pdf_url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="h-8 px-2 hover:bg-primary/10"
                      title={`View ${getFileTypeLabel()}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        console.log('DataTable: Download clicked', material);
                        if (onDownload) {
                          onDownload(material);
                        } else if (material.pdf_url) {
                          // Fallback: trigger browser download/open
                          const a = document.createElement('a');
                          a.href = material.pdf_url;
                          a.target = '_blank';
                          a.rel = 'noopener noreferrer';
                          // try to set filename if possible
                          a.download = material.title && material.title.includes('.') ? material.title : undefined;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                        }
                      }}
                      className="h-8 px-2 hover:bg-green-100 hover:text-green-700"
                      title={`Download ${getFileTypeLabel()}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, materials.length)} of{" "}
            {materials.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};