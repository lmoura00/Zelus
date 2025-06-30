import { useContext } from 'react';
import { AuthContext } from '../context/user-context';

export function useAuth() {
    const context = useContext(AuthContext);

    return context;
}

