// src/types/requestTypes.ts

export interface IoTData {
    deviceId: string;
    timestamp: string;
    metrics: {
      heartRate: number;
      temperature: number;
    };
  }
  
export interface HealthKitData {
  userId: string;
  timestamp: string;
  stepCount: number;
  caloriesBurned: number;
}

export interface GenomicData {
  patientId: string;
  timestamp: string;
  snps: { rsId: string; gene: string; impact: string }[];
}

export interface DocumentData {
  documentId: string;
  patientId: string;
  timestamp: string;
  type: string;
  parsedText: string;
  extractedFields: ExtractedFields;
}

export type ExtractedFields = 
  | { [key: string]: string }  // For general documents (non-bloodwork)
  | BloodworkFields;           // For bloodwork-specific documents

export interface BloodworkFields {
  bloodwork: { [key: string]: number }; // Dictionary of bloodwork entries with numeric values
}

  