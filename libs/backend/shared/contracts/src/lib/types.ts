export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface FeatureFlag {
    id: string;
    name: string;
    enabled: boolean;
    description?: string;
}

export interface AnalyticsEvent {
    id: string;
    type: string;
    payload: any;
    timestamp: Date;
}
