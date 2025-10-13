import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ResumeData } from "./ResumeSaathi";
import { toast } from "sonner";

interface PdfGeneratorProps {
  data: ResumeData;
  template: string;
  onDownload: () => Promise<void>;
  disabled?: boolean;
}

export const PdfGenerator = ({ data, template, onDownload, disabled }: PdfGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (disabled) {
      toast.error("Daily download limit reached. Try again tomorrow.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const resumeElement = document.getElementById('resume-content');
      if (!resumeElement) {
        throw new Error('Resume content not found. Please ensure the preview is visible.');
      }

      console.log("Starting PDF generation for:", data.personalInfo.fullName);

      // Wait for all fonts to load
      await document.fonts.ready;
      
      // Wait for all images to load
      const images = resumeElement.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      );

      // Small delay to ensure all CSS is applied
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Capturing resume with html2canvas...");

      // Configure html2canvas for better quality and style preservation
      const canvas = await html2canvas(resumeElement, {
        scale: 3, // Higher resolution for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false,
        imageTimeout: 0,
        // Ensure proper rendering of all elements
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('resume-content');
          if (clonedElement) {
            // Ensure all styles are inline and visible
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'relative';
            clonedElement.style.left = '0';
            clonedElement.style.top = '0';
          }
        }
      });

      console.log("Canvas generated, creating PDF...");

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit A4 page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Convert pixels to mm (assuming 96 DPI)
      const imgWidthMm = (imgWidth * 25.4) / (96 * 3); // Divide by scale factor
      const imgHeightMm = (imgHeight * 25.4) / (96 * 3);
      
      // Scale to fit page width while maintaining aspect ratio
      const scale = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm);
      const finalWidth = imgWidthMm * scale;
      const finalHeight = imgHeightMm * scale;
      
      // Center on page
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 0;
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');

      // Add metadata
      pdf.setProperties({
        title: `${data.personalInfo.fullName} Resume`,
        subject: 'Professional Resume',
        author: data.personalInfo.fullName,
        creator: 'KIIT Saathi Resume Builder',
      });

      // Generate filename
      const fileName = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      
      console.log("Downloading PDF:", fileName);
      
      // Download the PDF
      pdf.save(fileName);
      
      // Call the onDownload callback to update counters
      await onDownload();
      
      toast.success("Resume downloaded successfully!");
      console.log("PDF generation completed successfully");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || disabled}
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download PDF — {data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf
        </>
      )}
    </Button>
  );
};
