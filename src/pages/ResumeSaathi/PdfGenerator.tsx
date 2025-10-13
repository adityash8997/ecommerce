import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2pdf from "html2pdf.js";
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
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log("Generating PDF with html2pdf.js...");

      // Generate filename
      const fileName = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;

      // Configure html2pdf options for perfect style preservation
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number], // [top, left, bottom, right] in mm
        filename: fileName,
        image: { 
          type: 'jpeg' as const, 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 3, // High resolution
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          onclone: (clonedDoc: Document) => {
            const clonedElement = clonedDoc.getElementById('resume-content');
            if (clonedElement) {
              // Ensure all styles are applied and visible
              clonedElement.style.display = 'block';
              clonedElement.style.position = 'relative';
              clonedElement.style.left = '0';
              clonedElement.style.top = '0';
              clonedElement.style.transform = 'none';
              
              // Force font rendering
              const allElements = clonedElement.getElementsByTagName('*');
              for (let i = 0; i < allElements.length; i++) {
                const el = allElements[i] as HTMLElement;
                const computedStyle = window.getComputedStyle(el);
                el.style.fontFamily = computedStyle.fontFamily;
                el.style.fontSize = computedStyle.fontSize;
                el.style.fontWeight = computedStyle.fontWeight;
                el.style.color = computedStyle.color;
                el.style.lineHeight = computedStyle.lineHeight;
              }
            }
          }
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const,
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'] 
        }
      };

      // Generate and download PDF
      await html2pdf().set(options).from(resumeElement).save();
      
      console.log("PDF downloaded:", fileName);
      
      // Call the onDownload callback to update counters
      await onDownload();
      
      toast.success("Resume downloaded successfully!");
      console.log("PDF generation completed successfully");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
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
