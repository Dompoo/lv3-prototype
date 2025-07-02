import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Eye, Grid3X3, Trash2, Info, Plus, X } from 'lucide-react';

interface ContentFilterControlsProps {
  mosaicEnabled: boolean;
  removeEnabled: boolean;
  onMosaicToggle: (enabled: boolean) => void;
  onRemoveToggle: (enabled: boolean) => void;
  filterKeywords?: string[];
  onFilterKeywordsChange?: (keywords: string[]) => void;
}

type FilterMode = 'original' | 'mosaic' | 'remove';

const ContentFilterControls: React.FC<ContentFilterControlsProps> = ({
  mosaicEnabled,
  removeEnabled,
  onMosaicToggle,
  onRemoveToggle,
  filterKeywords = [],
  onFilterKeywordsChange,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
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
          <h2 className="text-xl font-semibold text-gray-800">키워드 필터링</h2>
          <Badge variant="secondary" className="ml-auto">
            데모 모드
          </Badge>
        </div>

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
                          ? mode.id === 'original' ? 'bg-blue-500 border-blue-500' : mode.id === 'mosaic' ? 'bg-orange-500 border-orange-500' : 'bg-red-500 border-red-500'
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

      </div>
    </TooltipProvider>
  );
};

export default ContentFilterControls;