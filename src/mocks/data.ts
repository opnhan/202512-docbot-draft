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

export const MOCK_HOSPITAL_DATA: DetailedHospitalStats[] = [
    {
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
                month: date.toISOString().slice(0, 7),
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
    },
    {
        regionCode: '11680', // Gangnam
        category: '피부과',
        hospitalName: '강남스킨피부과',
        address: '서울특별시 강남구 강남대로 456',
        openDate: '2020-03-15',
        area: 120.0,
        doctorCount: 2,
        equipment: ['레이저', '고주파', 'IPL', '피코레이저'],
        avgMonthlyRevenue: 180000000,
        growthRate: 8.5,
        floatingPopulation: 200000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 150000000;
            const random = Math.random() * 60000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(2000 + Math.random() * 800),
            };
        }),
        demographics: {
            gender: { male: 35, female: 65 },
            age: {
                '10대': 8,
                '20대': 35,
                '30대': 30,
                '40대': 18,
                '50대': 7,
                '60대이상': 2,
            },
        },
        dayDistribution: {
            '월': 18, '화': 20, '수': 19, '목': 18, '금': 15, '토': 10, '일': 0
        },
        timeDistribution: {
            '09-11': 20, '11-13': 25, '13-15': 20, '15-17': 20, '17-19': 15
        }
    },
    {
        regionCode: '11650', // Seocho
        category: '치과',
        hospitalName: '서초브라이트치과',
        address: '서울특별시 서초구 서초대로 789',
        openDate: '2019-07-01',
        area: 100.0,
        doctorCount: 4,
        equipment: ['3D CT', '디지털 X-ray', '구강스캐너', '임플란트 기구'],
        avgMonthlyRevenue: 95000000,
        growthRate: 3.8,
        floatingPopulation: 120000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 80000000;
            const random = Math.random() * 30000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1200 + Math.random() * 400),
            };
        }),
        demographics: {
            gender: { male: 48, female: 52 },
            age: {
                '10대': 15,
                '20대': 20,
                '30대': 25,
                '40대': 25,
                '50대': 10,
                '60대이상': 5,
            },
        },
        dayDistribution: {
            '월': 19, '화': 20, '수': 18, '목': 19, '금': 17, '토': 7, '일': 0
        },
        timeDistribution: {
            '09-11': 22, '11-13': 18, '13-15': 20, '15-17': 22, '17-19': 18
        }
    },
    {
        regionCode: '11650', // Seocho
        category: '정형외과',
        hospitalName: '서초메디컬정형외과',
        address: '서울특별시 서초구 반포대로 234',
        openDate: '2017-11-20',
        area: 180.0,
        doctorCount: 5,
        equipment: ['MRI', 'X-ray', '초음파', '물리치료기구', '도수치료실'],
        avgMonthlyRevenue: 140000000,
        growthRate: 6.2,
        floatingPopulation: 100000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 120000000;
            const random = Math.random() * 40000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1800 + Math.random() * 600),
            };
        }),
        demographics: {
            gender: { male: 55, female: 45 },
            age: {
                '10대': 5,
                '20대': 15,
                '30대': 20,
                '40대': 30,
                '50대': 20,
                '60대이상': 10,
            },
        },
        dayDistribution: {
            '월': 20, '화': 19, '수': 18, '목': 19, '금': 18, '토': 6, '일': 0
        },
        timeDistribution: {
            '09-11': 25, '11-13': 20, '13-15': 18, '15-17': 20, '17-19': 17
        }
    },
    {
        regionCode: '11440', // Mapo
        category: '내과',
        hospitalName: '마포건강내과의원',
        address: '서울특별시 마포구 마포대로 567',
        openDate: '2021-02-10',
        area: 130.0,
        doctorCount: 2,
        equipment: ['X-ray', '초음파', '심전도', '혈액분석기'],
        avgMonthlyRevenue: 85000000,
        growthRate: 7.1,
        floatingPopulation: 90000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 70000000;
            const random = Math.random() * 30000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1300 + Math.random() * 500),
            };
        }),
        demographics: {
            gender: { male: 50, female: 50 },
            age: {
                '10대': 3,
                '20대': 30,
                '30대': 35,
                '40대': 20,
                '50대': 8,
                '60대이상': 4,
            },
        },
        dayDistribution: {
            '월': 21, '화': 19, '수': 18, '목': 18, '금': 17, '토': 7, '일': 0
        },
        timeDistribution: {
            '09-11': 28, '11-13': 22, '13-15': 15, '15-17': 18, '17-19': 17
        }
    },
    {
        regionCode: '11440', // Mapo
        category: '피부과',
        hospitalName: '홍대메디피부과',
        address: '서울특별시 마포구 양화로 890',
        openDate: '2022-06-01',
        area: 95.0,
        doctorCount: 1,
        equipment: ['레이저', 'IPL', '고주파'],
        avgMonthlyRevenue: 75000000,
        growthRate: 12.5,
        floatingPopulation: 180000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 60000000;
            const random = Math.random() * 30000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1000 + Math.random() * 400),
            };
        }),
        demographics: {
            gender: { male: 30, female: 70 },
            age: {
                '10대': 5,
                '20대': 45,
                '30대': 30,
                '40대': 15,
                '50대': 4,
                '60대이상': 1,
            },
        },
        dayDistribution: {
            '월': 17, '화': 19, '수': 20, '목': 19, '금': 16, '토': 9, '일': 0
        },
        timeDistribution: {
            '09-11': 18, '11-13': 22, '13-15': 20, '15-17': 22, '17-19': 18
        }
    },
    {
        regionCode: '11680', // Gangnam
        category: '치과',
        hospitalName: '역삼화이트치과',
        address: '서울특별시 강남구 역삼로 321',
        openDate: '2016-09-15',
        area: 110.0,
        doctorCount: 3,
        equipment: ['3D CT', '디지털 X-ray', '구강스캐너'],
        avgMonthlyRevenue: 110000000,
        growthRate: 4.5,
        floatingPopulation: 160000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 95000000;
            const random = Math.random() * 30000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1400 + Math.random() * 500),
            };
        }),
        demographics: {
            gender: { male: 45, female: 55 },
            age: {
                '10대': 10,
                '20대': 25,
                '30대': 30,
                '40대': 22,
                '50대': 10,
                '60대이상': 3,
            },
        },
        dayDistribution: {
            '월': 20, '화': 19, '수': 18, '목': 19, '금': 17, '토': 7, '일': 0
        },
        timeDistribution: {
            '09-11': 23, '11-13': 19, '13-15': 19, '15-17': 21, '17-19': 18
        }
    },
    {
        regionCode: '11650', // Seocho
        category: '피부과',
        hospitalName: '강남역클리닉피부과',
        address: '서울특별시 서초구 강남대로61길 15',
        openDate: '2021-04-01',
        area: 140.0,
        doctorCount: 3,
        equipment: ['레이저', '피코레이저', '고주파', 'IPL', '초음파'],
        avgMonthlyRevenue: 165000000,
        growthRate: 9.8,
        floatingPopulation: 210000,
        referenceDate: '2025-11-01',
        monthlyRevenue: Array.from({ length: 36 }, (_, i) => {
            const date = new Date(2023, 0 + i, 1);
            const base = 140000000;
            const random = Math.random() * 50000000;
            return {
                month: date.toISOString().slice(0, 7),
                amount: Math.floor(base + random),
                transactionCount: Math.floor(1900 + Math.random() * 700),
            };
        }),
        demographics: {
            gender: { male: 32, female: 68 },
            age: {
                '10대': 6,
                '20대': 38,
                '30대': 32,
                '40대': 17,
                '50대': 6,
                '60대이상': 1,
            },
        },
        dayDistribution: {
            '월': 19, '화': 20, '수': 18, '목': 19, '금': 16, '토': 8, '일': 0
        },
        timeDistribution: {
            '09-11': 19, '11-13': 24, '13-15': 21, '15-17': 21, '17-19': 15
        }
    }
];

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
    },
    {
        id: 3,
        title: '강남역 메디컬타워 소형 매물',
        regionCode: '11680',
        latitude: 37.497942,
        longitude: 127.027621,
        deposit: 80000000,
        monthlyRent: 6000000,
        areaPyeong: 30,
        floor: 4,
        description: '강남역 2번 출구 도보 5분, 치과/한의원 적합',
        buildingScale: '지하 1층 / 지상 12층',
        rentFloor: '4층',
        maintenanceFee: 1000000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 1,
        approvalDate: '2018-05-12',
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 4,
        title: '서초역 메디컬센터 넓은 공간',
        regionCode: '11650',
        latitude: 37.483569,
        longitude: 127.032657,
        deposit: 120000000,
        monthlyRent: 9500000,
        areaPyeong: 55,
        floor: 2,
        description: '서초역 직결, 정형외과/재활의학과 추천, 주차 넉넉',
        buildingScale: '지하 2층 / 지상 10층',
        rentFloor: '2층 전체',
        maintenanceFee: 1800000,
        moveInDate: '2026-01-01 이후',
        parkingCount: 4,
        approvalDate: '2020-03-15',
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 5,
        title: '교대역 의료복합빌딩',
        regionCode: '11650',
        latitude: 37.493500,
        longitude: 127.013889,
        deposit: 200000000,
        monthlyRent: 15000000,
        areaPyeong: 80,
        floor: 6,
        description: '교대역 3번 출구, 대형 병원 개원 최적, 엘리베이터 3대',
        buildingScale: '지하 3층 / 지상 18층',
        rentFloor: '6층 전체',
        maintenanceFee: 2500000,
        moveInDate: '협의 가능',
        parkingCount: 5,
        approvalDate: '2021-08-20',
        imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 6,
        title: '서초동 신축 메디컬타워',
        regionCode: '11650',
        latitude: 37.489500,
        longitude: 127.017000,
        deposit: 180000000,
        monthlyRent: 13000000,
        areaPyeong: 70,
        floor: 8,
        description: '2024년 신축, 최신 설비, 피부과/성형외과 특화',
        buildingScale: '지하 2층 / 지상 15층',
        rentFloor: '8층',
        maintenanceFee: 2200000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 3,
        approvalDate: '2024-02-10',
        imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 7,
        title: '홍대입구역 역세권 매물',
        regionCode: '11440',
        latitude: 37.557192,
        longitude: 126.925381,
        deposit: 90000000,
        monthlyRent: 7000000,
        areaPyeong: 40,
        floor: 3,
        description: '홍대입구역 5번 출구 도보 2분, 피부과/미용의원 추천',
        buildingScale: '지하 1층 / 지상 8층',
        rentFloor: '3층',
        maintenanceFee: 1300000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 2,
        approvalDate: '2019-11-05',
        imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 8,
        title: '마포역 메디컬빌딩',
        regionCode: '11440',
        latitude: 37.541421,
        longitude: 126.945139,
        deposit: 110000000,
        monthlyRent: 8500000,
        areaPyeong: 50,
        floor: 4,
        description: '마포역 1번 출구, 내과/가정의학과 적합, 편의시설 우수',
        buildingScale: '지하 2층 / 지상 12층',
        rentFloor: '4층 일부',
        maintenanceFee: 1600000,
        moveInDate: '2026-02-01 이후',
        parkingCount: 2,
        approvalDate: '2017-06-15',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 9,
        title: '공덕역 초역세권 소형',
        regionCode: '11440',
        latitude: 37.544582,
        longitude: 126.951652,
        deposit: 70000000,
        monthlyRent: 5500000,
        areaPyeong: 28,
        floor: 2,
        description: '공덕역 직결, 1인 개원 최적, 렌트프리 3개월',
        buildingScale: '지하 1층 / 지상 7층',
        rentFloor: '2층',
        maintenanceFee: 900000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 1,
        approvalDate: '2020-09-30',
        imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 10,
        title: '강남구청역 프리미엄',
        regionCode: '11680',
        latitude: 37.517305,
        longitude: 127.041430,
        deposit: 250000000,
        monthlyRent: 18000000,
        areaPyeong: 100,
        floor: 7,
        description: '강남구청역 초역세권, 대형 종합병원 개원 가능, VIP 고객층',
        buildingScale: '지하 4층 / 지상 25층',
        rentFloor: '7층 전체',
        maintenanceFee: 3000000,
        moveInDate: '협의 가능',
        parkingCount: 6,
        approvalDate: '2023-04-20',
        imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 11,
        title: '선릉역 메디컬오피스',
        regionCode: '11680',
        latitude: 37.504421,
        longitude: 127.049144,
        deposit: 130000000,
        monthlyRent: 10000000,
        areaPyeong: 52,
        floor: 5,
        description: '선릉역 10번 출구, 치과/한의원 추천, 주차 3대',
        buildingScale: '지하 2층 / 지상 14층',
        rentFloor: '5층',
        maintenanceFee: 1700000,
        moveInDate: '2026-03-01 이후',
        parkingCount: 3,
        approvalDate: '2019-12-10',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 12,
        title: '신논현역 의료타운',
        regionCode: '11680',
        latitude: 37.504692,
        longitude: 127.025605,
        deposit: 140000000,
        monthlyRent: 11000000,
        areaPyeong: 58,
        floor: 6,
        description: '신논현역 1번 출구, 성형외과/피부과 밀집 지역',
        buildingScale: '지하 3층 / 지상 16층',
        rentFloor: '6층',
        maintenanceFee: 1900000,
        moveInDate: '즉시 입주 가능',
        parkingCount: 3,
        approvalDate: '2021-07-25',
        imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
    }
];
