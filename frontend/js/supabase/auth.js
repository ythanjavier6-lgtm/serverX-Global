/**
 * Módulo de Autenticación - Supabase
 * Maneja: login, registro, logout, reset password, verificación 2FA
 */

const AuthModule = (() => {
  let currentUser = null;
  let currentSession = null;
  const listeners = [];

  const notifyListeners = (event, data) => {
    listeners.forEach(listener => listener({ event, data }));
  };

  const onAuthChange = (callback) => {
    listeners.push(callback);
  };

  const signup = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { 
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          }
        }
      });
      if (error) throw error;
      console.log(' Registro exitoso');
      notifyListeners('signup', { user: data.user });
      return { success: true, user: data.user };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signin = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentUser = data.user;
      currentSession = data.session;
      localStorage.setItem('supabase_token', data.session.access_token);
      console.log(' Login exitoso');
      notifyListeners('signin', { user: data.user });
      return { success: true, user: data.user };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const signinWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/admin/dashboard.html` }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signout = async () => {
    try {
      await supabase.auth.signOut();
      currentUser = null;
      currentSession = null;
      localStorage.removeItem('supabase_token');
      console.log(' Sesión cerrada');
      notifyListeners('signout', {});
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      currentUser = user;
      return user;
    } catch (error) {
      return null;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
      });
      if (error) throw error;
      console.log(' Email enviado');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      console.log(' Contraseña actualizada');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyEmail = async (email, token) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
      console.log(' Email verificado');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getSession = () => currentSession;
  const getUser = () => currentUser;
  const isAuthenticated = () => !!currentUser;

  return {
    signup, signin, signinWithGoogle, signout, getCurrentUser,
    resetPassword, updatePassword, verifyEmail,
    getSession, getUser, isAuthenticated, onAuthChange
  };
})();
