import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

/* ========== API Response & Request Types ========== */

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
    name: string;
    email: string;
    password: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    phoneNumber?: string;
}

/* ========== Consultation Object Type ========== */

export type Consultation = {
    id: string;
    question: string;
    answers: string[];
    likes: number;
    category: string;
};

/* ========== Stack Navigation ========== */

export type RootStackParamList = {
    Home: undefined;
    Profile:undefined;
    Settings:undefined;
    Map: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    AddProduct: undefined;
    ConsultationDetails: { consultation: Consultation };
};

/* ========== Tab Navigation ========== */

export type MainTabParamList = {
    Home: undefined;
    Marketplace: undefined;
    Help: undefined;
    Consultation: undefined;
    Jobs: undefined;
    Community: undefined;
};

/* ========== Screen Props ========== */

// Stack Props
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type ConsultationDetailsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'ConsultationDetails'
>;
export type ConsultationDetailsScreenRouteProp = RouteProp<
    RootStackParamList,
    'ConsultationDetails'
>;


export type HomeTabScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
