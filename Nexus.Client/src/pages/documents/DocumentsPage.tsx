import React, { useEffect, useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type NexusDocument = {
  id: number;
  title: string;
  originalFileName: string;
  contentType?: string | null;
  fileSizeBytes: number;
  status: string;
  signatureText?: string | null;
  signedAt?: string | null;
  createdAt: string;
  uploadedByUserId: number;
  uploadedByName: string;
  receiverUserId?: number | null;
  receiverName?: string | null;
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<NexusDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [receiverUserId, setReceiverUserId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Documents/my-documents');

      setDocuments(response.data.documents || []);
    } catch (error: any) {
      console.error('Fetch documents error:', error);

      const message =
        error.response?.data?.message || 'Failed to load documents';

      toast.error(message);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === '') {
      toast.error('Please enter document title');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', selectedFile);

      if (receiverUserId.trim() !== '') {
        formData.append('receiverUserId', receiverUserId);
      }

      await api.post('/Documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Document uploaded successfully');

      setTitle('');
      setReceiverUserId('');
      setSelectedFile(null);

      const fileInput = document.getElementById(
        'document-file'
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = '';
      }

      await fetchDocuments();
    } catch (error: any) {
      console.error('Upload document error:', error);

      const message =
        error.response?.data?.message || 'Failed to upload document';

      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (documentItem: NexusDocument) => {
    try {
      setActionLoadingId(documentItem.id);

      const response = await api.get(
        `/Documents/${documentItem.id}/download`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');

      link.href = url;
      link.download = documentItem.originalFileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download document error:', error);

      const message =
        error.response?.data?.message || 'Failed to download document';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSign = async (documentId: number) => {
    const signatureText = window.prompt(
      'Enter your signature text:',
      'Signed by user'
    );

    if (!signatureText || signatureText.trim() === '') {
      return;
    }

    try {
      setActionLoadingId(documentId);

      const response = await api.put(`/Documents/${documentId}/sign`, {
        signatureText,
      });

      toast.success(response.data.message || 'Document signed successfully');

      await fetchDocuments();
    } catch (error: any) {
      console.error('Sign document error:', error);

      const message =
        error.response?.data?.message || 'Failed to sign document';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (documentId: number) => {
    const confirmReject = window.confirm(
      'Are you sure you want to reject this document?'
    );

    if (!confirmReject) {
      return;
    }

    try {
      setActionLoadingId(documentId);

      const response = await api.put(`/Documents/${documentId}/reject`);

      toast.success(response.data.message || 'Document rejected successfully');

      await fetchDocuments();
    } catch (error: any) {
      console.error('Reject document error:', error);

      const message =
        error.response?.data?.message || 'Failed to reject document';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (documentId: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoadingId(documentId);

      const response = await api.delete(`/Documents/${documentId}`);

      toast.success(response.data.message || 'Document deleted successfully');

      await fetchDocuments();
    } catch (error: any) {
      console.error('Delete document error:', error);

      const message =
        error.response?.data?.message || 'Failed to delete document';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusClass = (status: string) => {
    if (status === 'Signed') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'Rejected') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Chamber
          </h1>
          <p className="text-gray-600">
            Upload, view, download, sign, reject, or delete your documents
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDocuments}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Upload Document
            </h2>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label
                htmlFor="document-title"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Title
              </label>

              <input
                id="document-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Investment Agreement"
              />
            </div>

            <div>
              <label
                htmlFor="receiver-user-id"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Receiver User ID
              </label>

              <input
                id="receiver-user-id"
                type="number"
                value={receiverUserId}
                onChange={(event) => setReceiverUserId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label
                htmlFor="document-file"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                File
              </label>

              <input
                id="document-file"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>

          <p className="mt-3 text-xs text-gray-500">
            Allowed files: PDF, DOC, DOCX, PNG, JPG, JPEG. Max size: 10 MB.
          </p>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading documents...</p>
          </CardBody>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <FileText size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No documents found
              </h2>

              <p className="mt-1 text-gray-600">
                Uploaded documents will appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((documentItem) => (
            <Card key={documentItem.id}>
              <CardBody>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <FileText size={24} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {documentItem.title}
                        </h2>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            documentItem.status
                          )}`}
                        >
                          {documentItem.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {documentItem.originalFileName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Size: {formatFileSize(documentItem.fileSizeBytes)} •
                        Uploaded by: {documentItem.uploadedByName} • Receiver:{' '}
                        {documentItem.receiverName || 'Not assigned'}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Uploaded at: {formatDateTime(documentItem.createdAt)}
                      </p>

                      {documentItem.signatureText && (
                        <p className="mt-2 text-sm text-green-700">
                          Signature: {documentItem.signatureText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === documentItem.id}
                      onClick={() => handleDownload(documentItem)}
                      className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      <Download size={15} />
                      Download
                    </button>

                    {documentItem.status !== 'Signed' &&
                      documentItem.status !== 'Rejected' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === documentItem.id}
                            onClick={() => handleSign(documentItem.id)}
                            className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            <CheckCircle size={15} />
                            Sign
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === documentItem.id}
                            onClick={() => handleReject(documentItem.id)}
                            className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </>
                      )}

                    <button
                      type="button"
                      disabled={actionLoadingId === documentItem.id}
                      onClick={() => handleDelete(documentItem.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};