import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Eye, Grid3X3, Trash2, Info } from 'lucide-react';

interface FilterControlsProps {
  mosaicEnabled: boolean;
  removeEnabled: boolean;
  onMosaicToggle: (enabled: boolean) => void;
  onRemoveToggle: (enabled: boolean) => void;
  filterKeywords?: string[];
  onFilterKeywordsChange?: (keywords: string[]) => void;
}

type FilterMode = 'original' | 'mosaic' | 'remove';

const keywordOptions = [
  { label: '광고', value: 'ad' },
  { label: '연예', value: 'news' },
  { label: '쇼핑', value: 'shopping' },
  { label: '위키', value: 'wiki' },
  { label: '강의', value: 'lecture' },
  { label: '영상', value: 'video' },
];

const FilterControls: React.FC<FilterControlsProps> = ({
  mosaicEnabled,
  removeEnabled,
  onMosaicToggle,
  onRemoveToggle,
  filterKeywords = ['ad', 'news', 'shopping', 'wiki', 'lecture', 'video'],
  onFilterKeywordsChange,
}) => {
  const [showKeywordFilter, setShowKeywordFilter] = useState(false);

  const getCurrentMode = (): FilterMode => {
    if (removeEnabled) return 'remove';
    if (mosaicEnabled) return 'mosaic';
    return 'original';
  };

  const handleModeChange = (mode: FilterMode) => {
    switch (mode) {
      case 'original':
        onMosaicToggle(false);
        onRemoveToggle(false);
        break;
      case 'mosaic':
        onMosaicToggle(true);
        onRemoveToggle(false);
        break;
      case 'remove':
        onMosaicToggle(false);
        onRemoveToggle(true);
        break;
    }
  };

  const currentMode = getCurrentMode();

  const modes = [
    {
      id: 'original' as FilterMode,
      label: '원본',
      icon: Eye,
      color: 'from-gray-50 to-gray-100 border-gray-200',
      activeColor: 'from-blue-100 to-blue-200 border-blue-300 bg-blue-50',
      description: '콘텐츠를 원본 그대로 표시합니다. 필터링을 적용하지 않습니다.'
    },
    {
      id: 'mosaic' as FilterMode,
      label: '모자이크 처리',
      icon: Grid3X3,
      color: 'from-orange-50 to-orange-100 border-orange-200',
      activeColor: 'from-orange-100 to-orange-200 border-orange-300 bg-orange-50',
      description: '부적절한 콘텐츠를 모자이크 처리하여 가려줍니다. 콘텐츠는 남아있지만 흐리게 표시됩니다.'
    },
    {
      id: 'remove' as FilterMode,
      label: '완전 제거',
      icon: Trash2,
      color: 'from-red-50 to-red-100 border-red-200',
      activeColor: 'from-red-100 to-red-200 border-red-300 bg-red-50',
      description: '부적절한 콘텐츠를 완전히 제거합니다. 해당 콘텐츠는 화면에 표시되지 않습니다.'
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">필터링 옵션</h2>
          <Badge variant="secondary" className="ml-auto">
            데모 모드
          </Badge>
        </div>

        <div>
          <Button
            variant={showKeywordFilter ? 'default' : 'outline'}
            size="sm"
            className="mb-2"
            onClick={() => setShowKeywordFilter((v) => !v)}
          >
            키워드로 카테고리
          </Button>
          {showKeywordFilter && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywordOptions.map((kw) => (
                <Button
                  key={kw.value}
                  variant={filterKeywords.includes(kw.value) ? 'default' : 'outline'}
                  size="sm"
                  className={filterKeywords.includes(kw.value) ? '' : 'opacity-50'}
                  onClick={() => {
                    if (!onFilterKeywordsChange) return;
                    if (filterKeywords.includes(kw.value)) {
                      onFilterKeywordsChange(filterKeywords.filter(k => k !== kw.value));
                    } else {
                      onFilterKeywordsChange([...filterKeywords, kw.value]);
                    }
                  }}
                >
                  {kw.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {modes.map((mode) => {
            const isActive = currentMode === mode.id;
            const IconComponent = mode.icon;
            
            return (
              <div
                key={mode.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isActive ? mode.activeColor : `bg-gradient-to-r ${mode.color}`
                }`}
                onClick={() => handleModeChange(mode.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive 
                      ? mode.id === 'original' ? 'bg-blue-500' : mode.id === 'mosaic' ? 'bg-orange-500' : 'bg-red-500'
                      : 'bg-gray-400'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                      {mode.label}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info className="w-4 h-4 text-gray-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{mode.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isActive 
                      ? mode.id === 'original' ? 'bg-blue-500 border-blue-500' : mode.id === 'mosaic' ? 'bg-orange-500 border-orange-500' : 'bg-red-500 border-red-500'
                      : 'bg-white border-gray-300'
                  }`}>
                    {isActive && (
                      <div className="w-full h-full rounded-full bg-white/30" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            현재 상태: {
              currentMode === 'remove' ? '완전 제거 모드' : 
              currentMode === 'mosaic' ? '모자이크 모드' : 
              '원본 모드'
            }
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FilterControls;
