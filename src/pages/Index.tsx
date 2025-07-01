import React, { useState, useRef, useEffect } from 'react';
import BrowserFrame from '@/components/BrowserFrame';
import ContentFilterControls from '@/components/ContentFilterControls';
import KeywordFilterControls from '@/components/KeywordFilterControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Filter } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { MockWebsitePersona1 } from '@/components/MockWebsite';

const Index = () => {
  const [mosaicEnabled, setMosaicEnabled] = useState(false);
  const [removeEnabled, setRemoveEnabled] = useState(false);
  const [showContentControls, setShowContentControls] = useState(false);
  const [showKeywordControls, setShowKeywordControls] = useState(false);
  const [personaIndex, setPersonaIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [filterKeywords, setFilterKeywords] = useState(['ad', 'news', 'shopping', 'wiki', 'lecture', 'video']);

  const personaData = [
    {
      description: '웹 콘텐츠의 부적절한 요소를 자동으로 필터링하여 안전한 브라우징 환경을 제공합니다',
      component: <BrowserFrame mosaicEnabled={mosaicEnabled} removeEnabled={removeEnabled} />,
    },
    {
      description: '카테고리를 기반으로 정확한 브라우징 환경을 제공합니다',
      component: <MockWebsitePersona1 mosaicEnabled={mosaicEnabled} removeEnabled={removeEnabled} filterKeywords={filterKeywords} />,
    },
  ];

  // personaIndex가 바뀌면 carousel도 이동하고 모달 닫기
  useEffect(() => {
    if (carouselApi) {
      carouselApi.scrollTo(personaIndex);
    }
    // 화면 전환 시 모든 모달 닫기
    setShowContentControls(false);
    setShowKeywordControls(false);
  }, [personaIndex, carouselApi]);

  // carousel에서 직접 이동 시 personaIndex도 동기화
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      const idx = carouselApi.selectedScrollSnap();
      setPersonaIndex(idx);
    };
    carouselApi.on('select', onSelect);
    return () => carouselApi.off('select', onSelect);
  }, [carouselApi]);

  return (
    <div className={`min-h-screen p-6 transition-all duration-1000 ${
      personaIndex === 0 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
        : 'bg-gradient-to-br from-green-50 to-emerald-100'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header + Carousel */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className={`text-4xl font-bold bg-clip-text text-transparent transition-all duration-1000 ${
              personaIndex === 0 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600'
            }`}>
              Cleen
            </h1>
          </div>
          <div className="relative flex items-center justify-center max-w-2xl mx-auto">
            <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
              <CarouselPrevious onClick={() => setPersonaIndex((personaIndex - 1 + personaData.length) % personaData.length)} />
              <CarouselContent>
                {personaData.map((item, idx) => (
                  <CarouselItem key={idx}>
                    <p className="text-lg text-gray-600">{item.description}</p>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext onClick={() => setPersonaIndex((personaIndex + 1) % personaData.length)} />
            </Carousel>
          </div>
        </div>

        {/* Browser Demo or Persona Demo */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {personaData[personaIndex].component}
          </div>

          {/* Control Buttons & Panels - 주소창 아래로 이동 */}
          <div className="absolute left-0 right-0 top-[68px] flex justify-end pr-8 z-30">
            <div className="flex flex-col items-end gap-2">
              {personaIndex === 0 ? (
                // 첫 번째 화면: 자극성 필터링
                <>
                  <Button
                    onClick={() => setShowContentControls(!showContentControls)}
                    className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 rounded-xl"
                    style={{ minWidth: 160 }}
                  >
                    <Settings className="w-6 h-6" />
                    자극성 필터링
                  </Button>
                  {showContentControls && (
                    <div className="mt-2 w-[333px]">
                      <Card className="p-6 bg-white/95 backdrop-blur-md shadow-2xl border-2 border-white/20">
                        <ContentFilterControls
                          mosaicEnabled={mosaicEnabled}
                          removeEnabled={removeEnabled}
                          onMosaicToggle={setMosaicEnabled}
                          onRemoveToggle={setRemoveEnabled}
                        />
                      </Card>
                    </div>
                  )}
                </>
              ) : (
                // 두 번째 화면: 키워드 카테고리
                <>
                  <Button
                    onClick={() => setShowKeywordControls(!showKeywordControls)}
                    className="h-14 px-8 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 rounded-xl"
                    style={{ minWidth: 160 }}
                  >
                    <Filter className="w-6 h-6" />
                    카테고리 필터링
                  </Button>
                  {showKeywordControls && (
                    <div className="mt-2 w-[333px]">
                      <Card className="p-6 bg-white/95 backdrop-blur-md shadow-2xl border-2 border-white/20">
                        <KeywordFilterControls
                          filterKeywords={filterKeywords}
                          onFilterKeywordsChange={setFilterKeywords}
                        />
                      </Card>
                    </div>
                  )}
                </>
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
