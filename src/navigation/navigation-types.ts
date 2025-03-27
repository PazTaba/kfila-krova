// navigation-types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// טיפוס לתגובה מהשרת אחרי התחברות
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

// טופס הרשמה
export interface RegisterRequestBody {
    gender: "male" | "female" | "other";
    name: string;
    age: number;
    email: string;
    password: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    phoneNumber?: string;
}

/* ========== Answer Object Type ========== */
export type Answer = {
    id: string;
    text: string;
    author: string;
    likes?: number;
    createdAt?: string; // ← חדש
  };
  

/* ========== Consultation Object Type ========== */
export type Consultation = {
    _id: string;
    question: string;
    answers: Answer[];
    likes: number;
    category: string;
    description?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    status?: string;
    createdAt?: string;
};


/* ========== Stack Navigation ========== */
export type RootStackParamList = {
    Home: undefined;
    Profile: undefined;
    Settings: undefined;
    Map: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    AddProduct: undefined;
    ConsultationStack: undefined;
    ConsultationDetails: { consultation: Consultation };
};

/* ========== ConsultationStackParamList ========== */
export type ConsultationStackParamList = {
    Consultation: undefined;
    AddConsultation: undefined;
    ConsultationDetails: { consultation: Consultation };
};

/* ========== Tab Navigation ========== */
export type MainTabParamList = {
    Home: undefined;
    Marketplace: undefined;
    Consultation: undefined;
    Jobs: undefined;
    Community: undefined;
};

/* ========== Screen Props ========== */
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type ConsultationDetailsScreenNavigationProp = NativeStackScreenProps<
    RootStackParamList,
    'ConsultationDetails'
>;
export type ConsultationDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ConsultationDetails'>;
