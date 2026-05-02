import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, clearError } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login: (data) => dispatch(login(data)),
    register: (data) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
