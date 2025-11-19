import React from 'react';
import { GroundingChunk } from '../types';
import { MapPin, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface GroundingChipsProps {
  chunks: GroundingChunk[];
}

export const GroundingChips: React.FC<GroundingChipsProps> = ({ chunks }) => {
  if (!chunks || chunks.length === 0) return null;

  // Separate chunks into types for organized display
  const mapChunks = chunks.filter(c => c.maps);
  const webChunks = chunks.filter(c => c.web);

  return (
    <div className="mt-3 flex flex-col gap-3">
      
      {/* MAPS SECTION */}
      {mapChunks.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            <MapPin size={12} />
            <span>Map Locations</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {mapChunks.map((chunk, idx) => {
              const data = chunk.maps;
              if (!data) return null;
              return (
                <a 
                  key={`map-${idx}`}
                  href={data.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <MapPin className="text-emerald-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-emerald-800">
                      {data.title || "Unknown Location"}
                    </h4>
                    {data.placeAnswerSources?.reviewSnippets?.[0]?.content && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
                        "{data.placeAnswerSources.reviewSnippets[0].content}"
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                      Open in Maps <ExternalLink size={10} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* WEB SECTION */}
      {webChunks.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <LinkIcon size={12} />
            <span>Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {webChunks.map((chunk, idx) => {
              const data = chunk.web;
              if (!data) return null;
              return (
                <a 
                  key={`web-${idx}`}
                  href={data.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 max-w-full px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs text-blue-800 hover:bg-blue-100 hover:text-blue-900 transition-colors truncate"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{data.title || "Web Source"}</span>
                  <ExternalLink size={10} className="flex-shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};