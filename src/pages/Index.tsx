import React, { useState } from 'react';
import BrowserFrame from '@/components/BrowserFrame';
import ContentFilterControls from '@/components/ContentFilterControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const [mosaicEnabled, setMosaicEnabled] = useState(false);
  const [removeEnabled, setRemoveEnabled] = useState(false);
  const [showContentControls, setShowContentControls] = useState(false);
  const [contentFilterKeywords, setContentFilterKeywords] = useState<string[]>(['욕설', '논란', '19금']);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Cleen
            </h1>
          </div>
          <p className="text-lg text-gray-600">웹 콘텐츠의 부적절한 요소를 자동으로 필터링하여 안전한 브라우징 환경을 제공합니다</p>
        </div>

        {/* Browser Demo */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <BrowserFrame mosaicEnabled={mosaicEnabled} removeEnabled={removeEnabled} filterKeywords={contentFilterKeywords} />
          </div>

          {/* Control Buttons & Panels - 주소창 아래로 이동 */}
          <div className="absolute left-0 right-0 top-[68px] flex justify-end pr-8 z-30">
            <div className="flex flex-col items-end gap-2">
              <Button
                onClick={() => setShowContentControls(!showContentControls)}
                className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 rounded-xl"
                style={{ minWidth: 160 }}
              >
                <Settings className="w-6 h-6" />
                키워드 필터링
              </Button>
              {showContentControls && (
                <div className="mt-2 w-[333px]">
                  <Card className="p-6 bg-white/95 backdrop-blur-md shadow-2xl border-2 border-white/20">
                    <ContentFilterControls
                      mosaicEnabled={mosaicEnabled}
                      removeEnabled={removeEnabled}
                      onMosaicToggle={setMosaicEnabled}
                      onRemoveToggle={setRemoveEnabled}
                      filterKeywords={contentFilterKeywords}
                      onFilterKeywordsChange={setContentFilterKeywords}
                    />
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>이것은 Cleen 서비스의 데모 버전입니다</p>
          <p>실제 웹사이트는 아니며, 필터링 기능을 시연하기 위한 목적입니다</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
