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
    type?: 'text' | 'revenue_report' | 'property_list' | 'visualization';
    data?: any;
    visualization?: VisualizationConfig;
}

export interface CommercialStat {
    regionCode: string;
    category: string;
    avgMonthlyRevenue: number;
    growthRate: number;
    referenceDate: string;
}

export interface DetailedHospitalStats extends CommercialStat {
    address: string;
    monthlyRevenue: { month: string; amount: number; transactionCount: number }[];
    dayDistribution: { [key: string]: number };
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

// ============================================
// Visualization System Types (v2.0)
// ============================================

export interface VisualizationConfig {
    chartType: 'line' | 'bar' | 'area' | 'pie' | 'comparison' | 'table' | 'metric';
    title: string;
    description?: string;
    data: ChartData;
    config?: ChartOptions;
}

export interface ChartData {
    labels: string[];
    datasets: Dataset[];
}

export interface Dataset {
    name: string;
    values: number[];
    color?: string;
}

export interface ChartOptions {
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    stacked?: boolean;
}

