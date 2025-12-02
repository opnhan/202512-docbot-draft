export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    type?: 'text' | 'revenue_report' | 'property_list';
    data?: any;
}

export interface CommercialStat {
    regionCode: string;
    category: string;
    avgMonthlyRevenue: number;
    growthRate: number;
    floatingPopulation: number;
    referenceDate: string;
}

export interface DetailedHospitalStats extends CommercialStat {
    hospitalName: string;
    address: string;
    openDate: string;
    area: number;
    doctorCount: number;
    equipment: string[];
    monthlyRevenue: { month: string; amount: number; transactionCount: number }[];
    demographics: {
        gender: { male: number; female: number };
        age: { [key: string]: number };
    };
    dayDistribution: { [key: string]: number };
    timeDistribution: { [key: string]: number };
}

export interface Property {
    id: number;
    title: string;
    deposit: number;
    monthlyRent: number;
    areaPyeong: number;
    floor: number;
    latitude: number;
    longitude: number;
    description: string;
    imageUrl?: string;
    regionCode?: string;
}

export interface DetailedProperty extends Property {
    buildingScale?: string;
    rentFloor?: string;
    maintenanceFee?: number;
    moveInDate?: string;
    parkingCount?: number;
    approvalDate?: string;
}

export interface ChatState {
    isOpen: boolean;
    messages: Message[];
    isLoading: boolean;
    toggleChat: () => void;
    addMessage: (message: Message) => void;
    setLoading: (loading: boolean) => void;
}
