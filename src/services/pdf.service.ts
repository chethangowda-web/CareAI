import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { uploadToS3 } from './s3.service';
import { logger } from '../utils/logger';

export interface ReportData {
  recordId: string;
  userName: string;
  date: string;
  symptoms: string;
  severity: number;
  temperature?: number;
  temperatureUnit?: string;
  urgencyLevel: string;
  explanation: string;
  selfCareSteps: string[];
}

export const generateAndUploadReport = async (data: ReportData): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = new PassThrough();
      const buffers: Buffer[] = [];

      doc.pipe(stream);
      stream.on('data', chunk => buffers.push(chunk));
      stream.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const key = `reports/${data.recordId}.pdf`;
        const url = await uploadToS3(pdfBuffer, key, 'application/pdf');
        resolve(url);
      });

      // Header
      doc.fontSize(24).fillColor('#1A73E8').text('CareAI Health Report', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#757575').text(
        'This report is generated for informational purposes only and does not constitute medical advice.',
        { align: 'center' }
      );
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#1A73E8');
      doc.moveDown();

      // Patient details
      doc.fontSize(14).fillColor('#212121').text('Patient Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#212121');
      doc.text(`Name: ${data.userName}`);
      doc.text(`Date: ${new Date(data.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}`);
      doc.moveDown();

      // Symptoms
      doc.fontSize(14).text('Reported Symptoms', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(data.symptoms);
      doc.moveDown(0.5);
      doc.text(`Duration: ${data.severity} | Severity: ${data.severity}/10`);
      if (data.temperature) {
        doc.text(`Temperature: ${data.temperature}°${data.temperatureUnit || 'C'}`);
      }
      doc.moveDown();

      // AI Result
      const urgencyColors: Record<string, string> = {
        SELF_CARE: '#2E7D32',
        SEE_DOCTOR: '#1A73E8',
        GO_TO_HOSPITAL: '#F57F17',
        CALL_EMERGENCY: '#C62828',
      };
      const urgencyColor = urgencyColors[data.urgencyLevel] || '#1A73E8';
      const urgencyLabel = data.urgencyLevel.replace(/_/g, ' ');

      doc.fontSize(14).fillColor('#212121').text('AI Assessment', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(13).fillColor(urgencyColor).text(`Recommended Action: ${urgencyLabel}`, { bold: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#212121').text(data.explanation, { lineGap: 4 });
      doc.moveDown();

      // Self-care steps
      doc.fontSize(14).text('Self-Care Steps', { underline: true });
      doc.moveDown(0.5);
      data.selfCareSteps.forEach((step, i) => {
        doc.fontSize(11).text(`${i + 1}. ${step}`, { lineGap: 3 });
      });
      doc.moveDown(2);

      // Disclaimer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#CBD5E1');
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#757575').text(
        'DISCLAIMER: CareAI provides health information for guidance only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.',
        { lineGap: 3 }
      );

      doc.end();
    } catch (err) {
      logger.error('PDF generation failed', { error: (err as Error).message });
      reject(err);
    }
  });
};
