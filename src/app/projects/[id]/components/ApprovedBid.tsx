import React from "react";
import { Users, FileText, Calendar, ClipboardCheck, Download } from "lucide-react";

type ApprovedBidProps = {
  approvedBid: {
    contractorName: string;
    price: number;
    timeline: string;
    status: string;
    attachments: Array<{
      fileName: string;
      fileUrl: string;
    }>;
  } | null;
};

const ApprovedBid: React.FC<ApprovedBidProps> = ({ approvedBid }) => {
  if (!approvedBid) {
    return (
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Approved Bid
        </h2>
        <p className="text-gray-600">No approved bid for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">
        Approved Bid
      </h2>

      <div>
        <p className="mb-3 flex items-center gap-2 text-gray-600">
          <Users className="h-6 w-6 text-black" />
          <span className="font-semibold">Contractor:</span> {approvedBid.contractorName}
        </p>
        <p className="mb-3 flex items-center gap-2 text-gray-600">
          <FileText className="h-6 w-6 text-black" />
          <span className="font-semibold">Price:</span> RM {approvedBid.price.toLocaleString()}
        </p>
        <p className="mb-3 flex items-center gap-2 text-gray-600">
          <Calendar className="h-6 w-6 text-black" />
          <span className="font-semibold">Timeline:</span> {approvedBid.timeline}
        </p>
        <p className="mb-3 flex items-center gap-2 text-gray-600">
          <ClipboardCheck className="h-6 w-6 text-black" />
          <span className="font-semibold">Status:</span> {approvedBid.status}
        </p>

        <h3 className="mb-3 text-lg font-semibold text-gray-800">Attachments</h3>
        {approvedBid.attachments.length > 0 ? (
          <ul className="space-y-2">
            {approvedBid.attachments.map((attachment, index) => (
              <li key={index} className="flex items-center justify-between rounded-md bg-gray-100 px-4 py-2 hover:bg-gray-200">
                <span className="truncate">{attachment.fileName}</span>
                <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500 hover:underline">
                  <Download className="mr-1 h-5 w-5" />
                  Download
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No attachments available.</p>
        )}
      </div>
    </div>
  );
};

export default ApprovedBid;
