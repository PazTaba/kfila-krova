// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/User';

type UserContextType = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};


export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('userData');
                const storedToken = await AsyncStorage.getItem('token');

                console.log('🧠 storedUser:', storedUser);
                console.log('🔑 storedToken:', storedToken);

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    console.log('✅ user loaded into context');
                } else {
                    console.log('⚠️ No user/token found in AsyncStorage');
                }
            } catch (err) {
                console.error('❌ Error loading user/token:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = async (userData: User, userToken: string) => {
        try {
            setUser(userData);
            setToken(userToken);
            await AsyncStorage.multiSet([
                ['userData', JSON.stringify(userData)],
                ['token', userToken],
                ['userId', userData.id],
            ]);
        } catch (err) {
            console.error('❌ Error saving user/token:', err);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            setToken(null);
            await AsyncStorage.multiRemove(['userData', 'token', 'userId']);
        } catch (err) {
            console.error('❌ Error clearing user/token:', err);
        }
    };

    return (
        <UserContext.Provider value={{ user, token, isLoading, login, logout,setUser }}>
            {children}
        </UserContext.Provider>
    );
};

