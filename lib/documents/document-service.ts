import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

export interface DocumentMetadata {
  name: string;
  type: DocumentType;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  url: string;
}

export class DocumentService {
  /**
   * Create document record in database
   */
  async createDocumentRecord(data: {
    name: string;
    type: DocumentType;
    url: string;
    size: number;
    employeeId?: string;
  }): Promise<{
    success: boolean;
    message: string;
    document?: any;
  }> {
    try {
      const document = await prisma.document.create({
        data: {
          name: data.name,
          type: data.type,
          url: data.url,
          size: data.size,
          employeeId: data.employeeId,
        },
      });

      console.log("[Document] Created:", {
        id: document.id,
        name: data.name,
        type: data.type,
      });

      return {
        success: true,
        message: "Document uploaded successfully",
        document,
      };
    } catch (error) {
      console.error("[Document] Error creating record:", error);
      return {
        success: false,
        message: "Failed to save document",
      };
    }
  }

  /**
   * Get documents for employee
   */
  async getEmployeeDocuments(
    employeeId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where: { employeeId },
          orderBy: { uploadedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.document.count({
          where: { employeeId },
        }),
      ]);

      return {
        success: true,
        documents,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("[Document] Error fetching:", error);
      return {
        success: false,
        documents: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      };
    }
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(
    type: DocumentType,
    employeeId?: string,
    limit: number = 50
  ) {
    try {
      const documents = await prisma.document.findMany({
        where: {
          type,
          ...(employeeId && { employeeId }),
        },
        orderBy: { uploadedAt: "desc" },
        take: limit,
      });

      return {
        success: true,
        documents,
      };
    } catch (error) {
      console.error("[Document] Error fetching by type:", error);
      return {
        success: false,
        documents: [],
      };
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        return {
          success: false,
          message: "Document not found",
        };
      }

      // Delete from Blob storage would happen here
      // For now, just delete the database record
      await prisma.document.delete({
        where: { id: documentId },
      });

      console.log("[Document] Deleted:", documentId);

      return {
        success: true,
        message: "Document deleted successfully",
      };
    } catch (error) {
      console.error("[Document] Error deleting:", error);
      return {
        success: false,
        message: "Failed to delete document",
      };
    }
  }

  /**
   * Get document count by type
   */
  async getDocumentStats(employeeId?: string) {
    try {
      const where = employeeId ? { employeeId } : {};

      const stats = await Promise.all([
        prisma.document.count({
          where: { ...where, type: "CONTRACT" },
        }),
        prisma.document.count({
          where: { ...where, type: "PAYSLIP" },
        }),
        prisma.document.count({
          where: { ...where, type: "TAX" },
        }),
        prisma.document.count({
          where: { ...where, type: "COMPLIANCE" },
        }),
        prisma.document.count({
          where: { ...where, type: "POLICY" },
        }),
        prisma.document.count({
          where: { ...where, type: "OTHER" },
        }),
      ]);

      return {
        success: true,
        stats: {
          contracts: stats[0],
          payslips: stats[1],
          taxDocuments: stats[2],
          compliance: stats[3],
          policies: stats[4],
          other: stats[5],
          total: stats.reduce((a, b) => a + b, 0),
        },
      };
    } catch (error) {
      console.error("[Document] Error getting stats:", error);
      return {
        success: false,
        stats: {
          contracts: 0,
          payslips: 0,
          taxDocuments: 0,
          compliance: 0,
          policies: 0,
          other: 0,
          total: 0,
        },
      };
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, employeeId?: string, limit: number = 20) {
    try {
      const documents = await prisma.document.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive" as any,
          },
          ...(employeeId && { employeeId }),
        },
        orderBy: { uploadedAt: "desc" },
        take: limit,
      });

      return {
        success: true,
        documents,
      };
    } catch (error) {
      console.error("[Document] Error searching:", error);
      return {
        success: false,
        documents: [],
      };
    }
  }

  /**
   * Get all documents (admin)
   */
  async getAllDocuments(limit: number = 100, offset: number = 0) {
    try {
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          orderBy: { uploadedAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.document.count(),
      ]);

      return {
        success: true,
        documents,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("[Document] Error getting all:", error);
      return {
        success: false,
        documents: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      };
    }
  }
}

export const documentService = new DocumentService();
