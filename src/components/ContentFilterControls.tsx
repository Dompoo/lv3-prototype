import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Eye, Grid3X3, Trash2, Info, Plus, X, Sparkles } from 'lucide-react';

export type SensitivityLevel = 1 | 2 | 3 | 4;

interface ContentFilterControlsProps {
  filterEnabled: boolean;
  mosaicEnabled: boolean;
  removeEnabled: boolean;
  purifyEnabled: boolean;
  onFilterToggle: (enabled: boolean) => void;
  onMosaicToggle: (enabled: boolean) => void;
  onRemoveToggle: (enabled: boolean) => void;
  onPurifyToggle: (enabled: boolean) => void;
  filterKeywords?: string[];
  onFilterKeywordsChange?: (keywords: string[]) => void;
  sensitivityLevel?: SensitivityLevel;
  onSensitivityLevelChange?: (level: SensitivityLevel) => void;
}

type FilterMode = 'mosaic' | 'remove' | 'purify';

const ContentFilterControls: React.FC<ContentFilterControlsProps> = ({
  filterEnabled,
  mosaicEnabled,
  removeEnabled,
  purifyEnabled,
  onFilterToggle,
  onMosaicToggle,
  onRemoveToggle,
  onPurifyToggle,
  filterKeywords = [],
  onFilterKeywordsChange,
  sensitivityLevel = 2,
  onSensitivityLevelChange,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const getCurrentMode = (): FilterMode => {
    if (removeEnabled) return 'remove';
    if (purifyEnabled) return 'purify';
    return 'mosaic';
  };

  const handleModeChange = (mode: FilterMode) => {
    switch (mode) {
      case 'mosaic':
        onMosaicToggle(true);
        onRemoveToggle(false);
        onPurifyToggle(false);
        break;
      case 'remove':
        onMosaicToggle(false);
        onRemoveToggle(true);
        onPurifyToggle(false);
        break;
      case 'purify':
        onMosaicToggle(false);
        onRemoveToggle(false);
        onPurifyToggle(true);
        break;
    }
  };

  const currentMode = getCurrentMode();

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !filterKeywords.includes(newKeyword.trim())) {
      onFilterKeywordsChange?.([...filterKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    onFilterKeywordsChange?.(filterKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddKeyword();
    }
  };

  const modes = [
    {
      id: 'purify' as FilterMode,
      label: '순화',
      icon: Sparkles,
      color: 'from-purple-50 to-purple-100 border-purple-200',
      activeColor: 'from-purple-100 to-purple-200 border-purple-300 bg-purple-50',
      description: '감지된 부적절한 텍스트 부분만 모자이크 처리합니다. 나머지 내용은 정상적으로 표시됩니다.'
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
        {/* Filter ON/OFF Switch */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800">필터링 활성화</span>
          </div>
          <button
            onClick={() => onFilterToggle(!filterEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              filterEnabled 
                ? 'bg-blue-600' 
                : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                filterEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {filterEnabled && (
          <>
            {/* Keyword Filter Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                필터링된 키워드
              </h3>
              
              <div className="flex gap-2">
                <Input
                  placeholder="키워드 추가"
                  value={newKeyword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddKeyword}
                  size="sm"
                  disabled={!newKeyword.trim() || filterKeywords.includes(newKeyword.trim())}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {filterKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filterKeywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary" 
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {keyword}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Sensitivity Level Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                민감도 설정
              </h3>
              
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4].map((level) => {
                  const isActive = sensitivityLevel === level;
                  const descriptions = {
                    1: '정확한 키워드만 검출',
                    2: '유사한 표현 포함',
                    3: '관련 내용 포함',
                    4: '연관성 있는 모든 내용'
                  };
                  
                  return (
                    <Tooltip key={level}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md flex items-center justify-center ${
                            isActive 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-600'
                          }`}
                          onClick={() => onSensitivityLevelChange?.(level as SensitivityLevel)}
                        >
                          <span className="font-semibold">{level}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">민감도 레벨 {level}</p>
                          <p className="text-sm mt-1">{descriptions[level as keyof typeof descriptions]}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            {/* Filtering Options Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                필터링 옵션
              </h3>
              
              <div className="flex gap-3 justify-center">
                {modes.map((mode) => {
                  const isActive = currentMode === mode.id;
                  const IconComponent = mode.icon;
                  
                  return (
                    <Tooltip key={mode.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md flex items-center justify-center ${
                            isActive 
                              ? mode.id === 'mosaic' ? 'bg-orange-500 border-orange-500' : mode.id === 'purify' ? 'bg-purple-500 border-purple-500' : 'bg-red-500 border-red-500'
                              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                          }`}
                          onClick={() => handleModeChange(mode.id)}
                        >
                          <IconComponent className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">{mode.label}</p>
                          <p className="text-sm mt-1">{mode.description}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>
    </TooltipProvider>
  );
};

export default ContentFilterControls;