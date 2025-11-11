import React from "react";
import { XCircle } from "lucide-react";

export type Technician = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  department: string | null;
  currentTickets: number;
  resolvedTickets: number;
  totalTickets: number;
  workload: number;
  technicianLevel: string;
  availabilityStatus: string;
  isActive: boolean;
  experience: number;
  technicianSkills: { skill: { id: number; name: string } }[];
};

type Props = {
  ticketJustification: string;
  technician: Technician;
  onClose: () => void;
};

export const AssignmentJustificationModal: React.FC<Props> = ({ technician,ticketJustification, onClose }) => {
  const matchingSkills = technician.technicianSkills.map(ts => ts.skill);
  const currentWorkload = technician.workload;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Assignment Justification</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Technician Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Technician Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Name:</span> {technician.name}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Level:</span> {technician.technicianLevel}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Department:</span> {technician.department || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Current Workload:</span> {currentWorkload} active tickets
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">Availability:</span>
                <span className={`ml-1 px-2 py-1 text-xs rounded ${
                  technician.availabilityStatus === 'available'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {technician.availabilityStatus}
                </span>
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {technician.email}
              </p>
            </div>
          </div>
        </div>

        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-900 mb-3">Skills ({matchingSkills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {matchingSkills.map(skill => (
                <span key={skill.id} className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Justification */}
        <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-6">
          <h4 className="text-lg font-semibold text-indigo-900 mb-3">AI Assignment Justification</h4>
          <div className="space-y-2">
            {matchingSkills.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-indigo-700">Skills match: {matchingSkills.length} aligned</span>
              </div>
            )}
            {technician.technicianLevel === 'senior' && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="text-indigo-700">Senior expertise for complex tasks</span>
              </div>
            )}
            {currentWorkload < 5 && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span className="text-indigo-700">Optimal workload ({currentWorkload} active tickets)</span>
              </div>
            )}
            {technician.availabilityStatus === 'available' && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-indigo-700">Immediately available</span>
              </div>
            )}
          </div>

          <div>
            {ticketJustification ? (
              <p className="mt-4 text-gray-800 whitespace-pre-wrap">{ticketJustification}</p>
            ) : (
              <p className="mt-4 text-gray-500 italic">No additional justification provided.</p>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
