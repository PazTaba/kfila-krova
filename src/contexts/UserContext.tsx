import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';


type UserContextType = {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('userData');
            const storedToken = await AsyncStorage.getItem('token');
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        };
        loadUser();
    }, []);

    const login = async (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('userId', userData.id);
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.multiRemove(['userData', 'token', 'userId']);
    };

    return (
        <UserContext.Provider value={{ user, token, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// ✅ זו השורה החשובה שחסרה לך:
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
