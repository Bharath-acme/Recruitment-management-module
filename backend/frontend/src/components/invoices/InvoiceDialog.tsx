import React from "react";


export function FullscreenModal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl min-h-[90vh] rounded-xl shadow-xl overflow-y-auto">
        
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-8 pb-8">
          {children}
        </div>

      </div>
    </div>
  );
}

export function SideDrawer({ open, onClose, children }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`absolute right-0 top-0 h-full bg-white  max-w-[95vw] shadow-xl transform transition-transform ${
          open ? 'translate-x-1' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-2 mr-10 border-b">
          <button onClick={onClose} className="text-gray-500 border rounded-full bg-red-200 border-red w-10 text-xl cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}

