import React from 'react';
import { MapPin, Maximize, Calendar, Car } from 'lucide-react';
import { DetailedProperty } from '../../types';

interface Props {
    data: DetailedProperty;
}

export const PropertyCard: React.FC<Props> = ({ data }) => {
    return (
        <div className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-200/30">
            {/* Image */}
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {data.imageUrl ? (
                    <img
                        src={data.imageUrl}
                        alt={data.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                            <div className="mb-2 text-4xl">🏢</div>
                            <p className="text-sm font-medium text-gray-400">No Image</p>
                        </div>
                    </div>
                )}
                <div className="absolute left-3 top-3 rounded-lg bg-gradient-to-br from-gray-900/90 to-gray-800/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                    {data.rentFloor || `${data.floor}층`}
                </div>
                <div className="absolute right-3 top-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-purple-500/50">
                    추천
                </div>
            </div>

            <div className="p-5">
                <div className="mb-4">
                    <h3 className="mb-1.5 line-clamp-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text">
                        {data.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="line-clamp-1 font-medium">{data.description}</span>
                    </div>
                </div>

                {/* Price */}
                <div className="mb-5 flex items-baseline gap-2 border-b border-gray-100 pb-5">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-semibold text-gray-500">보증금</span>
                        <span className="text-2xl font-black text-gray-900">
                            {(data.deposit / 100000000).toFixed(1)}
                        </span>
                        <span className="text-sm font-bold text-gray-600">억</span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-semibold text-gray-500">월세</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {(data.monthlyRent / 10000).toLocaleString()}
                        </span>
                        <span className="text-sm font-bold text-gray-600">만</span>
                    </div>
                </div>

                {/* Specs */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Maximize size={13} />
                            <span className="text-[10px] font-semibold">면적</span>
                        </div>
                        <span className="text-sm font-black text-gray-900">{data.areaPyeong}평</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Calendar size={13} />
                            <span className="text-[10px] font-semibold">입주</span>
                        </div>
                        <span className="text-sm font-black text-gray-900">{data.moveInDate || '협의'}</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-3">
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Car size={13} />
                            <span className="text-[10px] font-semibold">주차</span>
                        </div>
                        <span className="text-sm font-black text-gray-900">{data.parkingCount || 0}대</span>
                    </div>
                </div>

                {/* Action Button */}
                <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 active:scale-95">
                    방문 예약하기
                </button>
            </div>
        </div>
    );
};
