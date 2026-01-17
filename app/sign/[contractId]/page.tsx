'use client';

import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface ContractData {
  id: string;
  room: {
    roomNumber: string;
    building: { name: string };
  };
  tenant: { name: string };
  rentAmountTHB: number;
  startDate: string;
  endDate: string;
  status: string;
  pdfUrl: string | null;
}

interface SigningPageProps {
  params: Promise<{ contractId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default function SigningPage({ params, searchParams }: SigningPageProps) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signerName, setSignerName] = useState('');
  const sigRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    async function init() {
      const { contractId } = await params;
      const { token: urlToken } = await searchParams;
      
      setToken(urlToken || null);

      try {
        const res = await fetch(`/api/contracts/${contractId}`);
        if (!res.ok) throw new Error('Contract not found');
        const data = await res.json();
        setContract(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [params, searchParams]);

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError('กรุณาลงลายเซ็น');
      return;
    }

    if (!signerName.trim()) {
      setError('กรุณากรอกชื่อ');
      return;
    }

    setSigning(true);
    setError(null);

    try {
      const signatureData = sigRef.current.toDataURL('image/png');
      const { contractId } = await params;

      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signerName: signerName.trim(),
          signatureData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign contract');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">ลงลายเซ็นสำเร็จ!</h1>
          <p className="text-gray-600 mb-4">
            ลายเซ็นของคุณถูกบันทึกเรียบร้อยแล้ว
          </p>
          {contract?.pdfUrl && (
            <a
              href={contract.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              ดูสัญญา
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Contract Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ลงลายเซ็นสัญญาเช่า
          </h1>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">ห้อง:</span>
              <p className="font-medium">
                {contract?.room.building.name} - {contract?.room.roomNumber}
              </p>
            </div>
            <div>
              <span className="text-gray-500">ค่าเช่า:</span>
              <p className="font-medium">
                ฿{contract?.rentAmountTHB.toLocaleString()}/เดือน
              </p>
            </div>
            <div>
              <span className="text-gray-500">เริ่มสัญญา:</span>
              <p className="font-medium">
                {contract?.startDate && new Date(contract.startDate).toLocaleDateString('th-TH')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">สิ้นสุดสัญญา:</span>
              <p className="font-medium">
                {contract?.endDate && new Date(contract.endDate).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>

          {contract?.pdfUrl && (
            <a
              href={contract.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-500 hover:underline text-sm"
            >
              📄 ดูรายละเอียดสัญญา
            </a>
          )}
        </div>

        {/* Signature Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ลงลายเซ็น
          </h2>

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ-สกุล
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="กรุณากรอกชื่อ-สกุล"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Signature Pad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ลายเซ็น
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  className: 'w-full h-48 touch-none',
                  style: { width: '100%', height: '192px' },
                }}
              />
            </div>
            <button
              onClick={clearSignature}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              🗑️ ล้างลายเซ็น
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSign}
            disabled={signing}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signing ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                กำลังบันทึก...
              </span>
            ) : (
              'ยืนยันลงลายเซ็น'
            )}
          </button>

          <p className="mt-4 text-xs text-gray-500 text-center">
            การลงลายเซ็นถือว่าท่านยอมรับข้อตกลงในสัญญานี้
          </p>
        </div>
      </div>
    </div>
  );
}
