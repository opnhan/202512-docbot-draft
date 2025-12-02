import { CommercialStat, Property } from '../features/docbot/types';

// 1. Hospital Info & Revenue Data (Combined for the 'CommercialStat' context)
// We extend the type slightly for the mock to include the detailed breakdown
export interface DetailedHospitalStats extends CommercialStat {
    hospitalName: string;
    address: string;
    openDate: string;
    area: number; // m2
    doctorCount: number;
    equipment: string[];
    monthlyRevenue: { month: string; amount: number; transactionCount: number }[];
    demographics: {
        gender: { male: number; female: number }; // %
        age: { [key: string]: number }; // '20s': 10, etc.
    };
    dayDistribution: { [key: string]: number }; // 'Mon': 15, etc.
    timeDistribution: { [key: string]: number }; // '09-12': 30, etc.
}

export const MOCK_HOSPITAL_DATA: DetailedHospitalStats = {
    regionCode: '11680', // Gangnam
    category: '내과',
    hospitalName: '서울베스트내과의원',
    address: '서울특별시 강남구 테헤란로 123',
    openDate: '2018-05-10',
    area: 150.5,
    doctorCount: 3,
    equipment: ['X-ray', '초음파', '내시경', '골밀도검사기'],
    avgMonthlyRevenue: 125000000,
    growthRate: 5.2,
    floatingPopulation: 150000,
    referenceDate: '2025-11-01',
    monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
        const date = new Date(2023, 0 + i, 1);
        const base = 100000000;
        const random = Math.random() * 40000000;
        return {
            month: date.toISOString().slice(0, 7), // YYYY-MM
            amount: Math.floor(base + random),
            transactionCount: Math.floor(1500 + Math.random() * 500),
        };
    }),
    demographics: {
        gender: { male: 45, female: 55 },
        age: {
            '10대': 5,
            '20대': 25,
            '30대': 35,
            '40대': 20,
            '50대': 10,
            '60대이상': 5,
        },
    },
    dayDistribution: {
        '월': 20, '화': 18, '수': 17, '목': 16, '금': 19, '토': 10, '일': 0
    },
    timeDistribution: {
        '09-11': 25, '11-13': 20, '13-15': 15, '15-17': 20, '17-19': 20
    }
};

// 2. Property Data
export interface DetailedProperty extends Property {
    buildingScale: string; // e.g., "지하 2층 / 지상 10층"
    rentFloor: string; // "3층"
    maintenanceFee: number;
    moveInDate: string; // "즉시 가능" or date
    parkingCount: number;
    approvalDate: string;
}

export const MOCK_PROPERTIES: DetailedProperty[] = [
    {
        id: 1,
        title: '강남역 도보 3분 메디컬 빌딩',
        regionCode: '11680',
        latitude: 37.498095,
        longitude: 127.027610,
        deposit: 100000000,
        monthlyRent: 8000000,
        areaPyeong: 45,
        floor: 3,
        description: '강남역 1번 출구 초역세권, 내과/이비인후과 추천, 렌트프리 2개월 지원',
        buildingScale: '지하 2층 / 지상 15층',
        rentFloor: '3층 전체',
        maintenanceFee: 1500000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 2,
        approvalDate: '2015-03-20',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 2,
        title: '역삼역 대로변 신축급 사무실',
        regionCode: '11680',
        latitude: 37.500628,
        longitude: 127.036436,
        deposit: 150000000,
        monthlyRent: 12000000,
        areaPyeong: 60,
        floor: 5,
        description: '테헤란로 대로변, 가시성 우수, 피부과/성형외과 최적',
        buildingScale: '지하 3층 / 지상 20층',
        rentFloor: '5층 일부',
        maintenanceFee: 2000000,
        moveInDate: '2025-12-15 이후',
        parkingCount: 3,
        approvalDate: '2022-01-10',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    }
];
