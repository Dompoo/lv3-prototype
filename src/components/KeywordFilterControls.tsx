import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface KeywordFilterControlsProps {
  filterKeywords: string[];
  onFilterKeywordsChange: (keywords: string[]) => void;
}

const keywordOptions = [
  { label: '광고', value: 'ad' },
  { label: '연예', value: 'news' },
  { label: '쇼핑', value: 'shopping' },
  { label: '위키', value: 'wiki' },
  { label: '강의', value: 'lecture' },
  { label: '영상', value: 'video' },
];

const KeywordFilterControls: React.FC<KeywordFilterControlsProps> = ({
  filterKeywords,
  onFilterKeywordsChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Filter className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">키워드 카테고리</h2>
        <Badge variant="secondary" className="ml-auto">
          데모 모드
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600">
        표시할 콘텐츠 타입을 선택하세요. 선택 해제된 타입은 검색 결과에서 제거됩니다.
      </p>

      <div className="flex flex-wrap gap-2">
        {keywordOptions.map((kw) => (
          <Button
            key={kw.value}
            variant={filterKeywords.includes(kw.value) ? 'default' : 'outline'}
            size="sm"
            className={`transition-all duration-200 ${
              filterKeywords.includes(kw.value) 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'opacity-50 hover:opacity-100'
            }`}
            onClick={() => {
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

      <div className="flex items-center justify-center gap-4 p-3 bg-gray-50 rounded-lg">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">
          선택된 카테고리: {filterKeywords.length}개 / {keywordOptions.length}개
        </span>
      </div>
    </div>
  );
};

export default KeywordFilterControls;