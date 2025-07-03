
import React from 'react';
import MockWebsite from './MockWebsite';
import { Chrome, RefreshCw, ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react';
import { SensitivityLevel } from './ContentFilterControls';

interface BrowserFrameProps {
  filterEnabled: boolean;
  mosaicEnabled: boolean;
  removeEnabled: boolean;
  purifyEnabled: boolean;
  filterKeywords?: string[];
  sensitivityLevel?: SensitivityLevel;
}

const BrowserFrame: React.FC<BrowserFrameProps> = ({
  filterEnabled,
  mosaicEnabled,
  removeEnabled,
  purifyEnabled,
  filterKeywords = [],
  sensitivityLevel = 2,
}) => {
  return (
    <div className="bg-gray-100">
      {/* Browser Header */}
      <div className="bg-gray-200 px-4 py-3 flex items-center gap-3 border-b">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
          <ArrowRight className="w-4 h-4" />
          <RefreshCw className="w-4 h-4" />
        </div>

        <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2">
          <Chrome className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">https://example-community.com</span>
        </div>

        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </div>

      {/* Website Content */}
      <div className="bg-white min-h-[600px]">
        <MockWebsite
          filterEnabled={filterEnabled}
          mosaicEnabled={mosaicEnabled}
          removeEnabled={removeEnabled}
          purifyEnabled={purifyEnabled}
          filterKeywords={filterKeywords}
          sensitivityLevel={sensitivityLevel}
        />
      </div>
    </div>
  );
};

export default BrowserFrame;
